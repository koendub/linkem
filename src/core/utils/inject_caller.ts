
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

      // Exponential backoff (after the first 3 injections to improve user experience on page load)
      if (injectionCount > 3) {
        const backoffTime = 10 * (backoffCounter * backoffCounter);
        backoffCounter += 1;
        const wait = backoffTime - since;
        if (wait > 0) {
          await new Promise(resolve => setTimeout(resolve, wait));
        }
      }

      // Inject and store the injection count and time for backoff logic
      const didInjectPromise = injector();
      const didInject = didInjectPromise instanceof Promise ? await didInjectPromise : didInjectPromise;
      console.log(`Injector: ${didInject ? 'Did inject' : 'Did not inject'}. Injection ${injectionCount}, Backoff ${backoffCounter}`);
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

  // Also inject on dynamic content changes, debounced so bursts of mutations
  // (e.g. a page still hydrating right after load) settle before we scan,
  // rather than running a full check mid-way through every single mutation.
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectorWrapper, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}
