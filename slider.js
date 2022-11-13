require('dotenv').config();

const { MongoClient } = require('mongodb');
const axios = require('axios');


const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;
const DB = process.env.DB_URL;
const movie_url_1 = `${base_url}trending/movie/day?api_key=${api_key}&language=en-US&page=1`;
const tv_url_1 = `${base_url}trending/tv/day?api_key=${api_key}&language=en-US&page=1`;



const dbName = "MEDIA_ID_MAP"
const client = new MongoClient(DB);


async function slider() {
    const array = []
  // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection_movie = db.collection('movies');
    const collection_tv = db.collection('tvshows');
    const res  = await fetch().catch(console.dir);
    const res_movie = await res[0]
    const res_tv = await res[1]
    await check_movie(res_movie, collection_movie, array)
    await check_tv(res_tv, collection_tv, array)
    const mes = await getMultipleRandom(array, 8);
    const response = await tagline(mes)
    // console.log(response[0])
    return response
}

async function main () {
    try {
    const res = await slider()
    return res
    }
    finally{ client.close()
    console.log("Client Disconnected")
    };
}


async function fetch() {
    try {
        const page_movie = axios.get(movie_url_1);
        const page_tv = axios.get(tv_url_1);
        const res = await Promise.all([page_movie, page_tv]).then(axios.spread((...responses) => {
            const response_movie = responses[0].data.results
            const response_tv = responses[1].data.results
            return [
                response_movie,
                response_tv
            ]
        }));
    return res
    } finally {
    }
  }

async function check_movie(res_movie, collection_movie, array) {
    const promise1 = await (res_movie|| []).map(async card => {
        const movies_FromDb = await collection_movie.findOne({ tmdb_id: card.id.toString() })
        // console.log(movies_FromDb)
            if (movies_FromDb !== null && card.vote_average > 7) {
                array.push(card);
            }
        });;
    await Promise.all(promise1);
}

async function check_tv(res_tv, collection_tv, array) {
    const promise2 = await (res_tv|| []).map(async card => {
        const movies_FromDb = await collection_tv.findOne({ tmdb_id: card.id.toString() })
        // console.log(movies_FromDb)
            if (movies_FromDb !== null && card.vote_average > 7.6) {
                array.push(card);
            }
        });
    await Promise.all(promise2);
}


async function getMultipleRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

async function tagline(mes) {
    const arr = []
    const promises = await (mes|| []).map(async card => {
        if (card.media_type == "tv") {
            const req = axios.get(`${base_url}tv/${card.id}?api_key=${api_key}&language=en-US`)
            const res = (await req).data.tagline
            card["tagline"] = res
            arr.push(card)
        } else {
            const req = axios.get(`${base_url}movie/${card.id}?api_key=${api_key}&language=en-US`)
            const res = (await req).data.tagline
            card["tagline"] = res
            arr.push(card)
        }
        });
    await Promise.all(promises);
    return arr
}



module.exports = { main }


