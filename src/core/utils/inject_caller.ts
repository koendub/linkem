
type InjectFunction = () => boolean | Promise<boolean>;

export function injectCaller(injector: InjectFunction) {
  let injectionCount = 0;
  let lastInjectionTime = 0;
  let injectionInProgress = false;
  let backoffCounter = 1;

  async function injectorWrapper() {
    if (injectionInProgress) return;
    injectionInProgress = true;
    try {
      const now = Date.now();
      const since = now - lastInjectionTime;

      // If it's been a while since the last injection, reset the backoff counter
      if (since > 10_000) {
        backoffCounter = 1;
      }

      // Exponential backoff (after the first 10 injections to improve user experience on page load)
      if (injectionCount > 10) {
        const backoffTime = backoffCounter * backoffCounter;
        const wait = backoffTime - since;
        if (wait > 0) {
          await new Promise(resolve => setTimeout(resolve, wait));
          backoffCounter += 1;
        }
      }

      // Reset backoff if it's been a while since the last injection
      const didInjectPromise = injector();
      const didInject = didInjectPromise instanceof Promise ? await didInjectPromise : didInjectPromise;
      if (didInject) {
        injectionCount += 1;
        lastInjectionTime = Date.now();
      }
    } finally {
      injectionInProgress = false;
    }
  }

  // Inject links when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectorWrapper);
  } else {
    injectorWrapper();
  }

  // Also inject on dynamic content changes
  const observer = new MutationObserver(injectorWrapper);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
}
