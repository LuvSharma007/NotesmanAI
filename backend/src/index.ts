import app from "./app.js"
import { DB } from "./db/client.js";
import {createClient} from 'redis'

const PORT = process.env.PORT || 4000

const pubClient = createClient({url:'redis://localhost:6379'})
const subClient = pubClient.duplicate();

await pubClient.connect()
await subClient.connect()

const port = process.env.PORT
const monogDBUri = process.env.MONGODB_URI
const mongodbName = process.env.MONGODB_NAME
console.log(`------------Port No:${port}`);
console.log(`------------MongoDB URI:${monogDBUri}`);
console.log(`------------MongoDB Name:${mongodbName}`);

DB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is listening on http:localhost:${PORT}`);    
    })
})
