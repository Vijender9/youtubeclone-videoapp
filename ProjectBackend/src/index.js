//   require('dotenv').config({path:'./env'}) : code ki consistency ko khrab krr deta hai
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




// import express from "express";
// const app=express();








// function connectDB(){}
//iffy somethin

// ;(async()=>{
//     try{
//       await moongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       app.on("error",()=>{
//         console.log("ERROR",error);
//         throw error
//       })
//       app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port${process.env.PORT}`)
//     })
//     }
    
//     catch(error){
//        console.error("Error:",error)
//        throw err
//     }
// })()