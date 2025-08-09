import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const addComment=asyncHandler(async(req,res)=>{
    const {videoId,text}=req.body;
    console.log("adding comment re body:",req.body)
    const userId=req.user.id;
    console.log("userid who commented",userId);
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
    if(!videoId || !text){
        throw new ApiError(400," Video Id and comment text required");
    }
    const newComment= new Comment({
        videoId,userId,text,
    });
    await newComment.save();

    res.status(201)
    .json(new ApiResponse(201,newComment,"Comment","Comment added successfully"))

});

// get comments for a video
  export const getComments= asyncHandler(async(req,res)=>{
         const {videoId}=req.params;
         const comments=await Comment.find({videoId}).populate("userId","username email");
         res.status(200)
         .json(new ApiResponse(200,comments,"Comments fetched successfully"));

 })
 // delete a comment
   export const deleteComment=asyncHandler(async(req,res)=>{
      const {id}=req.params;
      const comment=await Comment.findById(id);
      if(!comment){
        throw new ApiError(404,"Comment not found");
      }
      if(comment.userId.toString()!==req.user.id){
        throw new ApiError(403,"Unauthorized to delete this comment");
      }
      await Comment.findByIdAndDelete(id);
      res.status(200)
      .json(new ApiResponse(200,null,"comment deleted successfully"))
   })