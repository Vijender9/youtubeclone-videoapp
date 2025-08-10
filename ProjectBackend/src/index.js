
import dotenv from "dotenv"
import mongoose from "mongoose";
import { app } from "./app.js";



import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";

  dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{

    //for error listen
    app.listen(process.env.PORT || 1000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed !!",err)
})











