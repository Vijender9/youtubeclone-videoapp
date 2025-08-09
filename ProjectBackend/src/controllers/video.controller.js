import exp from "constants";
import multer from "multer";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from"fs"
import { title } from "process";

//upload Videos
const uploadVideo= asyncHandler( async(req,res)=> {

 const {title,description,duration,isPublished}=req.body
 console.log( "req.body :",req.body)
   const videoFilePath= req.file?.path;
   console.log("req.files id:",req.files)
   if(!videoFilePath )
   {
    throw new ApiError(400,"videofile is gone Missing")

   }

   const cloudinaryResponse = await uploadOnCloudinary(videoFilePath, {
    resource_type: "video",
    eager: [
      {
        format: "jpg",
        width: 300,
        height: 200,
        crop: "pad",
        gravity: "auto"
      },
    ],
  });
  console.log("cloudinary response is :",cloudinaryResponse);
   if(!cloudinaryResponse){
    throw new ApiError(400 ,"Something went wrong while uploading")

   }

      // Generate the thumbnail URL dynamically
      const thumbnailUrl = cloudinaryResponse.secure_url
      .replace("/upload/", "/upload/so_0.5,w_300,h_200,c_fill/")
      .replace(".mp4", ".jpg");


// // Get thumbnail URL (either from eager transformation or fallback to video URL)
// const thumbnailURL = cloudinaryResponse.eager?.[0]?.secure_url;

//const thumbnailURL = cloudinaryResponse.eager[0].secure_url;
console.log("thumbnail:",thumbnailUrl )
  // ✅ Get video duration from Cloudinary
  const videoDuration = cloudinaryResponse.duration || 0; // Default to 0 if missing

  console.log("Video Duration:", videoDuration);

   // ✅ Check if file exists before deleting
   if (fs.existsSync(videoFilePath)) {
    fs.unlinkSync(videoFilePath);
    console.log("Temp file deleted successfully:", videoFilePath);
  } else {
    console.warn("Temp file not found, skipping delete:", videoFilePath);
  }

   console.log("isPublished:",req.body);
   console.log("is Published :",isPublished);
    const newVideo=new Video({
        videoFile:cloudinaryResponse.secure_url,
        thumbnail:thumbnailUrl,
        owner:req.user.id,
        title,
        description,
        duration: videoDuration, //Number(req.body.duration) || 0,
        isPublished : req.body.isPublished ?? true,//req.body.isPublished === "true" || req.body.isPublished === true, // ✅ Handles both string & boolean
    })

    await newVideo.save();
     return res
     .status(200)
    .json(new ApiResponse(200, newVideo, " Video is uploaded successfully"))

})

// get all videos
const getVideos= asyncHandler(async(req,res)=>{
    console.log( "is published is:",req.body.isPublished)
     const videos=await Video.find({isPublished:true})
     .populate("owner","username email avatar");
   
     return res.status(200)
     .json(new ApiResponse (200,videos,"Videos fetched successfully")) 

})

//get a single video by ID
const getVideoById= asyncHandler(async(req,res)=>{
    const video=await Video.findById(req.params.id).populate("owner","username email avatar");
    if(!video){
        throw new ApiError( 400,"Video not found at backend") 
    }

    return res.
    status(200)
    .json( {
        title:video.title,
        description:video.description,
        // videoFile:videoUrl,
        // ...video.toObject(),
        channelId: video.owner._id, // ✅ Ensure frontend gets channelId
        owner:video.owner,
        // channelUserAvatar: video.owner, 
        videoFile: video.videoFile,
        views:video.views, 
    })

})

//delete Video
const deleteVideo= asyncHandler(async(req,res)=>{
    const deletedVideo=await Video.findByIdAndDelete(req.params.id);
    if(!deletedVideo){
        throw new ApiError(404,"video is not found for deletion")

    }
    return res.
    status(200)
    .json(new ApiResponse(200,"Video uploaded successfully"))

})
 
const updateVideo= asyncHandler(async(req,res)=>{
    const updatedVideo=await Video.findByIdAndUpdate(req.params.id,req.body,{new:true});
    if(!updatedVideo){
        throw new ApiError(404," video not found for updation")

    }
    return res.
    status(200)
    .json(new ApiResponse(200, updatedVideo,"video is updated successfully"))
})

const getMyUploads=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    console.log("logged user trying to access his videos",userId);
    const videos=await Video.find({ owner:userId});
     if(!videos || videos.length === 0){
        throw new Error("404","No uploaded Videos By user");
        
     }
     res.status(200).json(new ApiResponse(200,videos,"Upload videos get successfully"));
})
















const likeVideo= asyncHandler(async(req,res)=>{
    const video=await Video.findById(req.params.id);
    if(!video){
        throw new ApiError(404,"video not found");
        const userId= req.user.id;
        if(!video.likes.includes(userId)){
            video.likes.push(userId);
            video.dislikes=video.dislikes.filter(id=> id.toString()!==userId)}
           

        }
        await video.save();
    return res
    .status(200)
    .json(new ApiResponse(200,"video liked successfully"))
    
    })

const dislikeVideo =asyncHandler(async(req,res)=>{
         const video = await Video.findById(req.params.id);
         console.log("video found")
         if(!video){
            throw new ApiError(404,"video not found for dislikes")
         }
         const userId=req.user.id;
         if(!video.dislikes.includes(userId)){
            video.dislikes.push(userId);
            video.likes=video.likes.filter(id=> id.toString()!== userId)
         }
         await video.save();

         res.status(200).json(200, "video disliked successfully")
    })

    const viewTracking = new Map(); // Temporary in-memory cache to track views

 const increaseViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user ? req.user._id.toString() : null;
    const userIP = req.ip; // Get user IP
      console.log("userId id :",userId);
      console.log("userIp is :",userIP);

    const uniqueKey = userId || userIP; // Track by userId (if logged in) or IP

    // Prevent fake views: Check if user already viewed in last 24 hours
    if (viewTracking.has(`${videoId}-${uniqueKey}`)) {
        return res.status(200).json(new ApiResponse(200, "View already counted in last 24 hours"));
    }

    // Update view count in DB
    const video = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Store view tracking in memory for 24 hours
    viewTracking.set(`${videoId}-${uniqueKey}`, Date.now());
    setTimeout(() => viewTracking.delete(`${videoId}-${uniqueKey}`), 24 * 60 * 60 * 1000);

    res.status(200).json(new ApiResponse(200, "View added successfully", video));
});





export {uploadVideo,getVideos,getVideoById,deleteVideo,updateVideo,likeVideo,dislikeVideo,getMyUploads,increaseViews}