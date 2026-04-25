import { DB } from "./db/client.js";
import app from "./app.js"

const PORT = Number(process.env.PORT) || 4000;

DB().then(()=>{
    app.listen(PORT,"0.0.0.0",()=>{
        console.log(`Server is listening on http://localhost:${PORT}`);    
    })
})
