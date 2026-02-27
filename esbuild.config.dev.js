// eslint-disable-next-line @typescript-eslint/no-require-imports
const esbuild = require('esbuild');

const env = {
    MODE: "DEVELOPMENT",
};

const define = {
    "__APP_CONFIG__": JSON.stringify(env),
};

esbuild.context({
    entryPoints: ["src/index.ts"],
    bundle: true,
    sourcemap: true,
    outfile: "public/bundle.js",
    define,
    loader: {
        ".ts": "ts",
        '.tmx': "text",
        '.tsx': "text",
    },
}).then(async (ctx) => {
    console.log("⚡ Starting local dev server...");

    await ctx.serve({
        servedir: "public",
        port: 8000,
    });
    await ctx.watch();

    console.log("🚀 Dev server running at http://localhost:8000");
});