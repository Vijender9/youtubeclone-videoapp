import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";



const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken() //these are methods
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken// add value in object 
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token ")
  }
}





const registerUser = asyncHandler(async (req, res) => {
  

  
  const { fullname, email, username, password } = req.body
  
  console.log(" request body data:", req.body);
 
  if (
    [fullname, email, username, password].some((field) =>
      field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

 
  const exitedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  console.log( "existed user is:",exitedUser);
  if (exitedUser) {
     return res.status(400).json(  new ApiResponse(409, "User with email or username already exist"))
  }

  // check for images and avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(req.files);
  

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }







  if (!avatarLocalPath) {
    throw new ApiError(404, "Avatar file is required")
  }

  // upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // check if avatar is uploaded or not
  if (!avatar) {
    throw new ApiError(404, "Avatar file is required")
  }

  // create user-object and place oin mogodb
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // removal of password and refreshToken
  
  const createdUser = await User.findById(user._id).select(

    "-password -refreshToken"// those things which we dont want 
  )

  //
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user")
  }

  //return response with properly Apiresponse

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registerd Successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {

  const { email, username, password } = req.body
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required")
  }
  const user = await User.findOne({  
    $or: [{ username }, { email }]
  }).select("+password");


  //find user
  if (!user) {
    throw new ApiError(404, "User does not Exist")
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("user found", user);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password doest not match")
  }
  

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
  console.log("generated tokens:",accessToken,refreshToken);
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


 
  const options = {//it is object

    

    httpOnly: true,

    secure: true

  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
      )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
  console.log("req.user", req.user);
  if (!req.user) {
    throw new ApiError(401, " User not authenticated")
  }
  await User.findByIdAndUpdate(
    req.user._id,
    {
      //mogodb opertator set update fields
      $set: {


        refreshToken: undefined
      }
    }, {
    new: true
  }
  )
  const options = {
    httpOnly: true,

    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token")

  }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordValid = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id, {
    $set: {
      fullname,
      email: email
    }
  }, {
    new: true // give the info after update
  }
  ).select("-password")
  return res.status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  // TODO :-> delete old image
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id, {
    $set: {
      avatar: avatar.url
    }
  },
    {
      new: true
    }
  ).select("-password")
  return res.status(200)
    .json(
      new ApiResponse(200, user, "Avatar is updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing")
  }
 
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id, {
    $set: {
      coverImage: coverImage.url
    }
  },
    {
      new: true
    }
  ).select("-password")
  return res.status(200)
    .json(
      new ApiResponse(200, user, "coverImage is updated successfully")
    )
})




const getUserChannelProfile = asyncHandler(async (req, res) => {


const {username} = req.params
if (!username?.trim()) {
  throw new ApiError(400, "username is missing")
}
console.log("req.user in channelprofile:",req.user?._id)
const subscribedTo = await User.aggregate([
  {
    $match: {
      username: username?.toLowerCase()

    }

  },
  {
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "subscribedTo",
      as: "subscribers"
    }
  },
  {
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo"
    }
  }, {
    $addFields: {// adding the additional fields
      subscribersCount: {
           $size:"$subscribers" // $ sign bcoz of fields
              },
              channelsSubscribedToCount:{
             $size:"$subscribedTo"
              },
              isSubscribed:{
                $cond:{
                  if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                  then:true,
                  else:false
                }
              }
    }
  },
  {
    $project:{// gives the projection not give all values only gives selected one 
       fullname:1,
       username:1,
       subscribersCount:1,
       channelsSubscribedToCount:1,
       isSubscribed:1,
       avatar:1,
       coverImage:1,
       email:1,

    }
  }
])
// if(!subscribedTo?.length){
//   throw new ApiError(404,"Channel does not exists")
// }

console.log("🔍 Aggregation result:", JSON.stringify(subscribedTo, null, 2));

if (!subscribedTo?.length) {
    console.log(" Channel does not exist:", username);
    throw new ApiError(404, "Channel does not exist");
}

console.log("✅ Channel found:", subscribedTo[0]);

return res
.status(200)
.json(
  new ApiResponse(200,subscribedTo[0],"User Channel fetched Successfully")

)
})


const storeWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.body; // Get video ID from request
  const userId = req.user._id; // Get logged-in user ID

  if (!videoId) {
    return res.status(400).json({ message: "Video ID is required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent duplicate entries in watch history
  if (!user.watchHistory.includes(videoId)) {
    user.watchHistory.unshift(videoId); // Add to beginning
    if (user.watchHistory.length > 50) {
      user.watchHistory.pop(); // Keep only last 50 videos
    }
    await user.save();
  }

  res.status(200).json({ message: "Watch history updated successfully" });
});


const getWatchHistory=asyncHandler(async(req,res)=>{
  console.log("req in watch history:",req.user._id);
  const user=await User.aggregate([
       {
        $match:{
          _id:new mongoose.Types.ObjectId(req.user._id) //req.user._id is string in monog db so throught this moongoose handle itself
        }
       },{
           $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
              {
                $lookup:{
                  from:"users",
                  localField:"owner",
                  foreignField:"_id",
                  as:"owner",
                  pipeline:[
                    {
                      $project:{
                        fullname:1,
                        username:1,
                        avatar:1,


                      }
                    },
                    //if we dont want to give array then we could do is give array first value
                    {
                      $addFields:{
                        owner:{
                          $first:"$owner"
                        }
                      }
                    } 
                  ]
                }
              }
            ]
           }
       }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "watched history fetched successfully"
    )
  )
})

const deleteFromWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const videoId = req.params.videoId;

  try {
    // Remove the videoId from the user's watchHistory array
    await User.findByIdAndUpdate(userId, { 
      $pull: { watchHistory: videoId } 
    });

    return res.status(200).json(new ApiResponse(200, null, "Video removed from watch history"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Failed to remove video from history"));
  }
});

const clearWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
   console.log("userid for clear history:",userId)
  try {
    // Set watchHistory to an empty array
    await User.findByIdAndUpdate(userId, { watchHistory: [] });

    return res.status(200).json(new ApiResponse(200, null, "Watch history cleared successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Failed to clear watch history"));
  }
});








export {
  registerUser, loginUser, logoutUser,
  refreshAccessToken, changeCurrentPassword,
  getCurrentUser, updateAccountDetails,
  updateUserAvatar, updateUserCoverImage,
  getUserChannelProfile,getWatchHistory,storeWatchHistory,deleteFromWatchHistory,clearWatchHistory
}