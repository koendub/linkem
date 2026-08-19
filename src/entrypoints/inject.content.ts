import { checkInjectLinks } from '@/core/inject';
import { injectCaller } from '@/core/utils/inject_caller';


function registerInjectLinks() {
  // This script is injected on-demand via browser.scripting.executeScript
  // (registration: 'runtime'), which background.ts can trigger more than
  // once for the same document (e.g. tabs.onUpdated firing 'complete'
  // more than once without an actual reload in between). Without this
  // guard, each extra execution creates its own independent
  // MutationObserver/injectCaller instance racing the others, which can
  // both pass the "not yet injected" check before either has inserted its
  // element and end up inserting duplicates.
  if ((window as any).__linkemInjectRegistered) return;
  (window as any).__linkemInjectRegistered = true;

  injectCaller(checkInjectLinks);
}

export default defineContentScript({
  registration: 'runtime',
  main: registerInjectLinks
});
