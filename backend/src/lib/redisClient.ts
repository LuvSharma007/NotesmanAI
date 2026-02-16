import {Redis} from "ioredis";


export const client = new Redis({
    host:"localhost",
    port:6379,
    maxRetriesPerRequest:null
})