import express from 'express'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import {auth} from "./lib/auth.js"
import cors from 'cors';

const app = express();

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
import chatRouter from "./routes/chat.routes.js"
import messageRouter from "./routes/messages.routes.js";
import urlRouter from "./routes/url.route.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/userchats",chatRouter)
app.use("/api/v1/userMessages",messageRouter)
app.use("/api/v1/url",urlRouter)



export default app;



