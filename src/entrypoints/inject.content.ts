import { checkInjectLinks } from '@/core/inject';
import { injectCaller } from '@/core/utils/inject_caller';


function registerInjectLinks() {
  injectCaller(checkInjectLinks);
}

export default defineContentScript({
  registration: 'runtime',
  main: registerInjectLinks
});
