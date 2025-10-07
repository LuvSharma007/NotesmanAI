import app from "./app.js"
import { DB } from "./db/client.js";

const PORT = process.env.PORT || 4000

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
