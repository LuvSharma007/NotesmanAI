import {Redis,RedisOptions} from "ioredis";


// export const client = new Redis({
//     host: process.env.REDIS_HOST || "localhost",
//     port:6379,
//     maxRetriesPerRequest:null
// })

const ConnectionOptions:RedisOptions={
    host:process.env.REDIS_HOST || "localhost",
    port:6379,
    maxRetriesPerRequest:null
}

export const client = new Redis(ConnectionOptions)