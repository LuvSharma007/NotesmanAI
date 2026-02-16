import app from "./app.js"
import { DB } from "./db/client.js";

const PORT = process.env.PORT || 4000

DB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is listening on http:localhost:${PORT}`);    
    })
})
