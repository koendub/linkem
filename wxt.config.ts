import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: "src",
  manifest: {
    permissions: ['storage', 'contextMenus']
  },
  webExt: {
    startUrls: [
      'https://oldschool.runescape.wiki/w/Uncut_sapphire',
      'https://oldschool.runescape.wiki/w/Toktz-xil-ak'
    ]
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
    ]
  })
});
