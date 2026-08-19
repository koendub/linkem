/**
 * Shared contract for the login flow between an injected subpage iframe, the
 * content script running on the host page, and the background script.
 *
 * 1. An injected iframe posts a `linkem-login-request` message to its parent
 *    window (via `window.parent.postMessage`) when it needs the user to log in.
 * 2. The content script (registerAuthLoginListener in inject.content.ts) only
 *    accepts such messages from `event.source` windows that belong to an
 *    iframe linkem itself injected, then forwards the request to the
 *    background script.
 * 3. The background script opens the login URL in a new tab, waits for the
 *    login to finish, copies the resulting cookies over for the host page's
 *    origin, and replies with `linkem-login-complete`.
 * 4. The content script reloads the iframe(s) that requested login.
 */

export const LOGIN_REQUEST_ACTION = 'linkem-login-request';
export const LOGIN_COMPLETE_ACTION = 'linkem-login-complete';

export interface LoginRequestMessage {
  action: typeof LOGIN_REQUEST_ACTION;
  /** The URL of the login/SSO page to open in a new tab. */
  loginUrl: string;
  /**
   * The cookie domain to copy after login, if it differs from the login
   * URL's own host (e.g. the SSO domain sets cookies for a shared parent
   * domain). Defaults to the login URL's hostname.
   */
  cookieDomain?: string;
}

export function isLoginRequestMessage(data: unknown): data is LoginRequestMessage {
  if (typeof data !== 'object' || data === null) return false;
  const message = data as Record<string, unknown>;
  if (message.action !== LOGIN_REQUEST_ACTION) return false;
  if (typeof message.loginUrl !== 'string') return false;
  if (message.cookieDomain !== undefined && typeof message.cookieDomain !== 'string') return false;
  try {
    // Only allow http(s) login URLs, never javascript: or other schemes.
    const url = new URL(message.loginUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Force an iframe to reload its current src. Simply reassigning `.src` to
 * the same string is not guaranteed to trigger a reload in every browser, so
 * we briefly hop it through about:blank first.
 */
export function reloadIframe(iframe: HTMLIFrameElement) {
  const src = iframe.src;
  iframe.src = 'about:blank';
  requestAnimationFrame(() => {
    iframe.src = src;
  });
}

/** requestId generator that doesn't depend on crypto.randomUUID (which requires a secure context). */
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}


interface PendingLogin {
  requestId: string;
  senderTabId: number;
  cookieDomain: string;
}

/**
 * Handles login requests forwarded from an injected subpage iframe (see
 * src/core/auth.ts and registerAuthLoginListener in inject.content.ts):
 * opens the login URL in a new tab, waits for the user to finish logging
 * in, copies the resulting cookies over so the iframe can use them, then
 * tells the originating tab to reload the iframe.
 */
export function loginFlowListener() {
  // Keyed by the id of the tab we opened to show the login page.
  const pendingLogins = new Map<number, PendingLogin>();

  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message?.action !== LOGIN_REQUEST_ACTION) return;
    if (!sender.tab?.id) {
      console.error('linkem: received a login request without a sender tab');
      return;
    }

    const loginUrl = message.loginUrl as string;
    const cookieDomain = (message.cookieDomain as string | undefined) || new URL(loginUrl).hostname;
    const loginTab = await browser.tabs.create({ url: loginUrl });
    if (!loginTab.id) return;
    pendingLogins.set(loginTab.id, { requestId: message.requestId, senderTabId: sender.tab.id, cookieDomain });
  });

  // A login page can signal it's done by navigating to a URL ending in this
  // hash (see examples/login-demo/login.html) - we then close the tab for
  // the user automatically instead of making them close it by hand.
  const doneHashSuffix = '#linkem-login-complete';
  browser.tabs.onUpdated.addListener(async (tabId, info) => {
    const pending = pendingLogins.get(tabId);
    if (!pending || !info.url?.endsWith(doneHashSuffix)) return;
    pendingLogins.delete(tabId);
    await finishLogin(pending);
    await browser.tabs.remove(tabId).catch(() => { });
  });

  // Fallback for login pages that don't use the sentinel above: treat the
  // user closing the login tab themselves as "done logging in".
  browser.tabs.onRemoved.addListener(async (tabId) => {
    const pending = pendingLogins.get(tabId);
    if (!pending) return;
    pendingLogins.delete(tabId);
    await finishLogin(pending);
  });

  async function finishLogin(pending: PendingLogin) {
    try {
      const senderTab = await browser.tabs.get(pending.senderTabId);
      if (senderTab.url) {
        await copyCookiesToEmbeddingPage(pending.cookieDomain, senderTab.url);
      }
    } catch (e) {
      console.error('linkem: failed to copy cookies after login', e);
    }
    try {
      await browser.tabs.sendMessage(pending.senderTabId, { action: LOGIN_COMPLETE_ACTION, requestId: pending.requestId });
    } catch (e) {
      console.error('linkem: failed to notify the page that login finished', e);
    }
  }
}

/**
 * Copies cookies set for `cookieDomain` (typically during the login flow
 * above) so an iframe embedding that domain on `embeddingPageUrl` can use
 * them. Requires host permission for `cookieDomain` - the extension already
 * needs that to inject into pages there, so this piggybacks on the same
 * permission grant.
 */
async function copyCookiesToEmbeddingPage(cookieDomain: string, embeddingPageUrl: string) {
  const hasPermission = await browser.permissions.contains({ origins: [`*://${cookieDomain}/*`] });
  if (!hasPermission) {
    console.warn(`linkem: missing host permission for ${cookieDomain}, cannot copy its login cookies into the iframe. Grant linkem access to that site to enable this.`);
    return;
  }

  const cookies = await browser.cookies.getAll({ domain: cookieDomain });
  const topLevelSite = new URL(embeddingPageUrl).origin;

  for (const cookie of cookies) {
    // The whole point of this copy is making the cookie usable from inside a
    // cross-site iframe, so we deliberately force SameSite=None (which in
    // turn requires Secure) regardless of what the source cookie was set
    // with - a Lax/Strict copy would just silently never be sent to the
    // iframe's requests, no matter how faithfully we copied it otherwise.
    const url = `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`;
    const base = {
      url,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: true,
      httpOnly: cookie.httpOnly,
      sameSite: 'no_restriction' as const,
      expirationDate: cookie.expirationDate,
    };

    // Chrome partitions third-party cookies per embedding top-level site
    // (CHIPS). Re-setting a copy scoped to the host page's own origin is
    // what makes the cookie usable from inside a cross-site iframe once
    // third-party cookies are otherwise blocked. Not supported everywhere
    // (e.g. Firefox), so this is best-effort on top of the plain set below.
    try {
      // @ts-ignore partitionKey isn't in the standard webextension-polyfill cookie types yet
      await browser.cookies.set({ ...base, partitionKey: { topLevelSite } });
    } catch {
      // Ignored - fall through to the plain, unpartitioned cookie set.
    }

    try {
      await browser.cookies.set(base);
    } catch (e) {
      console.error(`linkem: failed to set cookie "${cookie.name}" for ${cookie.domain}`, e);
    }
  }
}


/**
 * Lets an injected subpage iframe ask the extension to log it in: the iframe
 * posts a `linkem-login-request` message to its parent, we open the login
 * page in a new tab, and once the background script tells us login is done
 * we reload the iframe(s) that asked for it. See src/core/auth.ts.
 */
export function registerAuthLoginListener() {
  const pendingRequests = new Map<string, HTMLIFrameElement>();

  window.addEventListener('message', (event: MessageEvent) => {
    if (!isLoginRequestMessage(event.data)) return;

    // Only trust login requests coming from a frame linkem itself injected -
    // matching by contentWindow identity can't be spoofed by page script.
    const iframe = Array.from(document.getElementsByClassName('linkem-injection'))
      .find((el): el is HTMLIFrameElement => el instanceof HTMLIFrameElement && el.contentWindow === event.source);
    if (!iframe) {
      console.warn('linkem: ignoring a login request from a frame linkem did not inject');
      return;
    }

    const requestId = generateRequestId();
    pendingRequests.set(requestId, iframe);
    browser.runtime.sendMessage({
      action: LOGIN_REQUEST_ACTION,
      requestId,
      loginUrl: event.data.loginUrl,
      cookieDomain: event.data.cookieDomain,
    });
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message?.action !== LOGIN_COMPLETE_ACTION) return;
    const iframe = pendingRequests.get(message.requestId);
    if (!iframe) return;
    pendingRequests.delete(message.requestId);
    reloadIframe(iframe);
  });
}
