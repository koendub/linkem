import { showCreateLinkModal } from "./createLinkModal";

export default defineContentScript({
  registration: 'runtime',
  main: () => {
    showCreateLinkModal();
  }
});
