import { registerInjectLinks } from "./injectLinks";
import { registerMessageListeners } from "./messageListeners";


export default defineContentScript({
  registration: 'runtime',
  main: () => {
    registerInjectLinks();
    registerMessageListeners();
  }
});
