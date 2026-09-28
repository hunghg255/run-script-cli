import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/nr', 'src/ni', 'src/nu', 'src/nx', 'src/nci'],
  clean: true,
  declaration: true,

  rollup: {
    emitCJS: true,
    cjsBridge: true,
    inlineDependencies: true,
    esbuild: {
      minify: false,
    },
  },
  failOnWarn: false,
});
