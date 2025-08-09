import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// for query somethin

const videoSchema=new mongoose.Schema({

  videoFile:{
   type:String,//cloudinary url
    required:true,
  },
  thumbnail:{
    type:String,//cloudinary url
    required:true,

  },
  owner:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"User"

  },
  title:{
    type:String,
    required:true,

  },
  description:{
    type:String,
    required:true,

  },
  duration:{ // dont give user 
    type:Number,////cloudinary url
    required:true


  },
  views:{
    type:Number,
    default:0

  },
  isPublished:{
    type:Boolean,
    default:true

  },
  likes: [
    { type: mongoose.Schema.Types.ObjectId,
       ref: "User" }
  ],  // Store user IDs
  dislikes: [
    { type: mongoose.Schema.Types.ObjectId,
       ref: "User" }
  ]


},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)