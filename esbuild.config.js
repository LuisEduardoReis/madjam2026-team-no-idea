// eslint-disable-next-line @typescript-eslint/no-require-imports
const esbuild = require('esbuild');

const env = {
    MODE: "PRODUCTION",
};

// Convert env into define object
const define = {
    "__APP_CONFIG__": JSON.stringify(env),
};

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'public/bundle.js',
    minify: true,
    sourcemap: false,
    target: 'es2020',
    loader: {
        '.ts': 'ts',
        '.tmx': "text",
        '.tsx': "text",
    },
    define,
}).catch(() => process.exit(1));
