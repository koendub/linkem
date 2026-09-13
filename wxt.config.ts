import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: "src",
  manifest: {
    permissions: ['storage', 'contextMenus', 'scripting', 'tabs', 'cookies'],
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
      // GoodReads
      'https://www.goodreads.com/book/show/61215351-the-fellowship-of-the-ring',
      // 'https://www.goodreads.com/book/show/60531406-tress-of-the-emerald-sea',

      // OSRS
      'https://oldschool.runescape.wiki/w/Uncut_sapphire',
      // 'https://oldschool.runescape.wiki/w/Toktz-xil-ak',

      // Random sites
      'https://www.target.com/',
      'https://www.amazon.com/',

      // Dev tools
      // 'about:debugging#/runtime/this-firefox'
      // 'https://buffer-flow.github.io/#/linkem',
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
