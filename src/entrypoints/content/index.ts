import { registerInjectLinks } from "./injectLinks";
import { registerMessageListeners } from "./messageListeners";


export function contentMain() {
  console.log('Running content script!');
  registerInjectLinks();
  registerMessageListeners();
}

export default defineContentScript({
  // matches: ['*://*/*'],
  registration: 'runtime',
  main: contentMain
});
