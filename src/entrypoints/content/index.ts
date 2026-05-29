import { registerInjectLinks } from "./injectLinks";
import { registerMessageListeners } from "./messageListeners";


export function contentMain() {
  registerInjectLinks();
  registerMessageListeners();
}

export default defineContentScript({
  matches: ['*://*/*'],
  main: contentMain
});
