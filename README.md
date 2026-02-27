## Raycaster Engine

Basic engine for a CPU rendered "raycaster" web game.  
Test it here: https://luisreis.net/games/raycaster-engine/

![Screenshot](/meta/screenshot1.png)

### Features:
- CPU [raycaster renderer](https://en.wikipedia.org/wiki/Ray_casting) with support for:
  - Textured walls, floors and ceilings
  - Billboard sprites
  - Sliding doors
  - Fog
- Support for an external level editor ([Tiled](https://www.mapeditor.org/));
- Texture packing ([TexturePacker](https://www.codeandweb.com/texturepacker));
- Simple menus and boilerplate UI code;

### Tech stack:
- Typescript
- [esbuild](https://esbuild.github.io/) - project bundling and dev server
- [p5.js](https://p5js.org/) - graphical and basic utility framework
- [howler.js](https://howlerjs.com/) - audio engine
- [pako](https://github.com/nodeca/pako) - zlib decompression (for Tiled maps)

### Getting started

```bash
# You will need node/npm to run this project (https://nodejs.org/en/download)
nvm use       # Use the node version defined in .nvmrc
npm install   # Install dependencies
npm run dev   # Run the project in dev mode
```

### NPM scripts
```bash
npm run dev                   # run the project in dev mode with file change detection and autobrowser reload
npm run build                 # build the project for production (output is the whole public dir)
npm run lint                  # run the linter
npm run textures:pack         # pack the textures using TexturePacker. Requires cli installation of TexturePacker
npm run textures:pack:watch   # same as above with file change detection
``` 

### Notes
- The project is configured to lint (currently disabled), build and commit the bundle on every commit using [husky](https://github.com/typicode/husky). This is to facilitate deployment making it so it only takes a git pull on the server.


### Author
Luis Eduardo Reis ([luisreis.net](https://luisreis.net/)) - 2026

### License

MIT License

Copyright (c) 2026 Luis Eduardo Reis