import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: "src",
  manifest: {
    permissions: ['storage', 'contextMenus', 'activeTab', 'tabs']
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
    ]
  })
});
