import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import path from "path";
import { fileURLToPath } from "url";






const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}));

app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({extended:true,
    limit:"16kb"
})) //can give nested objects
app.use(express.static("public")) // pdf or image store ->make public asset


app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/videos.routes.js"
import commentRouter from "./routes/comment.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"



app.use("/api/v1/users",userRouter)


app.use("/api/v1/videos",videoRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/subscriptions", subscriptionRoutes);








export{app}
