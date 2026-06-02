import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: "src",
  manifest: {
    permissions: ['storage', 'contextMenus', 'scripting', 'tabs'],
    // @ts-ignore
    optional_permissions: ["*://*/*"],
    optional_host_permissions: ["*://*/*"],
    browser_specific_settings: {
      gecko: {
        id: '@linkem',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  webExt: {
    startUrls: [
      'https://buffer-flow.github.io/#/linkem',
      
      // OSRS
      // 'https://oldschool.runescape.wiki/w/Uncut_sapphire',
      // 'https://oldschool.runescape.wiki/w/Toktz-xil-ak',

      // IMDB
      'https://www.imdb.com/title/tt0068646/?ref_=chttp_t_2',
      // 'https://www.imdb.com/title/tt0468569/?ref_=chttp_t_3',
      // 'https://www.imdb.com/title/tt0167260/?ref_=chttp_t_6',

      // GoodReads
      // 'https://www.goodreads.com/book/show/61215351-the-fellowship-of-the-ring',
      'https://www.goodreads.com/book/show/60531406-tress-of-the-emerald-sea',

      // Random sites
      'https://www.target.com/',
      'https://www.amazon.com/',

      // Dev tools
      // 'about:debugging#/runtime/this-firefox'
    ]
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
    ],
    define: {
      '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    }
  })
});
