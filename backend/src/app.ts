import express from 'express'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import {auth} from "./lib/auth.js"
import cors from 'cors';

const app = express();

console.log(`MonogDBUri:${process.env.MONGODB_URI}`);
console.log(`MonogDBName:${process.env.MONGODB_NAME}`);

app.use(
    cors({
        origin:'http://localhost:3000',
        methods:["GET","POST","PUT","DELETE"],
        credentials:true
    })
)


app.all('/api/auth/*splat',toNodeHandler(auth));

app.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});

app.use(express.json())
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter)



export default app;



