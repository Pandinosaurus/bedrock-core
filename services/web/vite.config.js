// - Errors not consistent (shows different errors on build if you run in succession)
// - Module resolution buggy, separate aliases required (see below)
// - When using aliases index.js sometimes won't resolve, needs to be explicit
// - JSX inside .js files doesn't seem to be supported
// - No clear way to run babel transforms
// - Bare minimum build: initial: ~4s rebuild: ~1.2s

export default {
  resolve: {
    alias: {
      // Needed as resolve.modules is not a thing with vite
      // and it doesn't seem to have basic module resolution
      // relative to src, even with "root" provided
      utils: 'src/utils',
      stores: 'src/stores',
      assets: 'src/assets',
      modals: 'src/modals',
      screens: 'src/screens',
      helpers: 'src/helpers',
      layouts: 'src/layouts',
      semantic: 'src/semantic',
      components: 'src/components',
    },
  },
};
