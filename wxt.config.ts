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
      // OSRS
      // 'https://oldschool.runescape.wiki/w/Uncut_sapphire',
      // 'https://oldschool.runescape.wiki/w/Toktz-xil-ak',

      // IMDB
      'https://www.imdb.com/title/tt0068646/?ref_=chttp_t_2',
      'https://www.imdb.com/title/tt0468569/?ref_=chttp_t_3',
      'https://www.imdb.com/title/tt0167260/?ref_=chttp_t_6'
    ]
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
    ]
  })
});
