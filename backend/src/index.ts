import app from "./app.js"
import { DB } from "./db/client.js";
import {createClient} from 'redis'

const PORT = process.env.PORT || 4000

const pubClient = createClient({url:'redis://localhost:6379'})
const subClient = pubClient.duplicate();

await pubClient.connect()
await subClient.connect()


DB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is listening on http:localhost:${PORT}`);    
    })
})
