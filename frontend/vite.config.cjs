const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

process.env.ESBUILD_BINARY_PATH = require.resolve('esbuild-wasm/bin/esbuild');

module.exports = defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
});
