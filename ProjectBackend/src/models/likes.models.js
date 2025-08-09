import mongoose from "mongoose";

const likesSchema=new mongoose.Schema({





    
},{timestamps:true})

export const Likes =mongoose.model("Likes",likesSchema)