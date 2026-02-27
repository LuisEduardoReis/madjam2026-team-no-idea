import p5 from "p5";
import pako from "pako";

import rawFarm from "@assets/tiled/mapFarm.tmx";
import rawForest from "@assets/tiled/mapForest.tmx";
import rawUnderground from "@assets/tiled/mapUnderground.tmx";
import rawTileset from "@assets/tiled/tileset.tsx";

export const MAP_FILENAMES: string[] = [];
export const TILED_FILES = new Map<string, p5.XML>;

function parseXml(rawMap1: string): p5.XML {
    const domParser = new DOMParser();
    const xmlDoc = domParser.parseFromString(rawMap1, "text/xml");

    // @ts-expect-error undocumented use of library (@see https://github.com/processing/p5.js/blob/28b17b5d887e68808e0e057b3e7eb5b1cddd86b3/src/io/files.js#L1421)
    return new p5.XML(xmlDoc.documentElement);
}

export async function loadTiledFiles() {
    [rawFarm, rawForest, rawUnderground].forEach((raw, index) => {
        const name = `map${index}`;
        TILED_FILES.set(name, parseXml(raw));
        MAP_FILENAMES.push(name);
    });
    TILED_FILES.set("tileset", parseXml(rawTileset));
}

export function decodeBase64Zlib(base64: string) {
    const decoded = atob(base64.replace(/[^A-Za-z0-9+/=]/g, ''));

    const decodedByteArray = new Uint8Array(decoded.length);
    for(let i = 0; i < decoded.length; i++) {
        decodedByteArray[i] = decoded.charCodeAt(i);
    }

    const decompressed = pako.inflate(decodedByteArray);

    const data = [];
    for(let i = 0; i < decompressed.length; i+=4) {
        const val =
            decompressed[i]
            + (decompressed[i + 1] << 8)
            + (decompressed[i + 2] << 16)
            + (decompressed[i + 3] << 24);
        data.push(val);
    }

    return data;
}
