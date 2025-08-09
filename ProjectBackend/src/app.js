import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import path from "path";
import { fileURLToPath } from "url";


// // Fix __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



const app = express()
// app.use(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true
// }))
 
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Replace process.env.CORS_ORIGIN for testing
    credentials: true
}));

app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({extended:true,
    limit:"16kb"
})) //can give nested objects
app.use(express.static("public")) // pdf or image store ->make public asset

// // ✅ Serve video uploads as static files
// app.use("/uploads/videos", express.static(path.join(__dirname, "uploads/videos")));
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/videos.routes.js"
import commentRouter from "./routes/comment.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"

// routes declaration
// we were doing app.get when we didint import routes like this 

app.use("/api/v1/users",userRouter)


app.use("/api/v1/videos",videoRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/subscriptions", subscriptionRoutes);








export{app}
