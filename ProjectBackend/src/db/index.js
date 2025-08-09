import mongoose from "mongoose";
import dotenv from "dotenv";
import {DB_NAME} from "../constants.js";

const connectDB=async ()=>{
    try{
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)//return object after connecting with db 
        console.log(`\n MongoDB conneted!! DB HOST:${connectionInstance.connection.host}`)//extracting host from that object to verify db connnected
        // console.log(`\n database name!:,${connectionInstance.connection.databases}`)
            
    }
    catch(error){
       console.log("MONGODB connection error",error);
       process.exit(1)

    }
}
export default connectDB