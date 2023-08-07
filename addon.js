const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');

const ONE_PACE_JSON_URL = 'https://onepace.net/_next/data/WgqGRQw6mCdLCxZ1iFx5J/en/watch.json';


const manifest = {
    id: 'one.pace',
    name: 'One Pace Addon',
    version: '1.0.0',
    description: 'Watch One Pace | The Definitive One Piece Viewing Experience',
    resources: ['catalog', 'meta', 'stream'],
    types: ['serie', 'anime'],
    catalogs: [{
        type: 'anime',
        id: 'one.pace',
        name: 'One Pace',
        extra: [{ name: 'search' }],
    }],
    behaviorHints: { configurable: false, configurationRequired: false },
    logo: "https://dl.strem.io/addon-logo.png",
    icon: "https://dl.strem.io/addon-logo.png",
    background: "https://dl.strem.io/addon-background.jpg",
}

const builder = new addonBuilder(manifest)

builder.defineCatalogHandler(async ({ type, id }) => {
    if (type === 'anime' && id === 'one.pace') {
        const response = await axios.get(ONE_PACE_JSON_URL)
        const arcs = response.data.pageProps.arcs
        const metas = arcs.map(arc => ({
            id: arc.id,
            type: 'anime',
            name: arc.invariant_title,
            poster: arc.images[0]?.src, // Assuming an image is available
        }))
        return { metas }
    }
    return { metas: [] }
})

builder.defineMetaHandler(async ({ type, id }) => {
    if (type === 'anime') {
        const response = await axios.get(ONE_PACE_JSON_URL)
        const arcs = response.data.pageProps.arcs
        const arc = arcs.find(a => a.id === id)
        if (arc) {
            const meta = {
                id: arc.id,
                type: 'anime',
                name: arc.invariant_title,
                poster: arc.images[0]?.src,
                description: arc.anime_episodes, // Example description
                // Additional metadata
            }
            return { meta }
        }
    }
    return { meta: null }
})

builder.defineStreamHandler(async ({ type, id }) => {
    if (type === 'anime') {
        const response = await axios.get(ONE_PACE_JSON_URL)
        const arcs = response.data.pageProps.arcs
        const arc = arcs.find(a => a.id === id)
        if (arc) {
            const streams = arc.downloads.map(download => ({
                title: download.type,
                infoHash: download.uri.split('hash=')[1],
            }))
            return { streams }
        }
    }
    return { streams: [] }
})

const addonInterface = builder.getInterface()

serveHTTP(addonInterface, { port: 3000 })
