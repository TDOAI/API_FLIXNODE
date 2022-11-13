require('dotenv').config();

const { MongoClient } = require('mongodb');
const axios = require('axios');
const { getPlaiceholder } = require('plaiceholder');


const base_url = process.env.BASE_URL;
const img_base_url = process.env.IMG_BASE_URL
const api_key = process.env.API_KEY;
const DB = process.env.DB_URL;

const dbName = "MEDIA_ID_MAP"
const client = new MongoClient(DB);

const fetch = async (type) => {
    try {
      const response_1 = await axios.get(`${base_url}${type}/popular?api_key=${api_key}&language=en-US&page=1`);
      const response_2 = await axios.get(`${base_url}${type}/popular?api_key=${api_key}&language=en-US&page=2`);
      const response_3 = await axios.get(`${base_url}${type}/popular?api_key=${api_key}&language=en-US&page=3`);
      const res = await Promise.all([response_1, response_2, response_3]).then(axios.spread((...responses) => {
        const array = [...responses[0].data.results, ...responses[1].data.results, ...responses[2].data.results]
        return array
    }));
    return res
    } catch (error) {
      throw new Error(`Unable to get the response for`);
    }
};
// 
async function check(res, collection_movie) {
    const arr = []
    const promises = await (res|| []).map(async card => {
        const movies_FromDb = await collection_movie.findOne({ tmdb_id: card.id.toString() })
        if (movies_FromDb !== null) {
            arr.push(card);
        }
    });
    await Promise.all(promises);
    return arr
}

async function blurhash(response, type) {
    const arr = []
    const promises = await (response|| []).map(async card => {
        const placeholder = await getPlaiceholder(`${img_base_url}w500${card.poster_path || card.backdrop_path}`)
        const res = placeholder.blurhash.hash
        card["blurhash"] = res
        if (type == 'movie') {
            card["media_type"] = "movie"
        } else {
            card["media_type"] = "tv"
        }
        arr.push(card)
    });
    await Promise.all(promises);
    return arr
}

async function coll (type, db) {
    if (type == 'movie') {
        return db.collection('movies');
    } else {
        return db.collection('tvshows');
    }
}

async function main (type) {
    try {
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = await coll(type, db)
        const res = await fetch(type);
        const response = await check(res, collection);
        const final = await blurhash(response, type)
        return final
    } finally {
        client.close()
        console.log("Client Disconnected")
    }
}

module.exports = { main }