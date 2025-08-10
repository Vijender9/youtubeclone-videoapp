import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";




const Subscribe = asyncHandler(async (req, res) => {
    const { subscribedTo } = req.params;
    const subscriber = req.user.id;

    if (!subscriber) {
        return res.status(400).json({ message: "Subscriber ID is required." });
    }

    const userToSubscribe = await User.findOne({ username: subscribedTo });

    if (!userToSubscribe) {
        return res.status(404).json({ message: "User not found." });
    }

    if (subscriber === userToSubscribe._id.toString()) {
        return res.status(400).json({ message: "You cannot subscribe to yourself." });
    }

    const existingSubscription = await Subscription.findOne({
        subscriber,
        subscribedTo: userToSubscribe._id,
    });

    if (existingSubscription) {
        return res.status(400).json({ message: "Already subscribed." });
    }

    const newSubscription = new Subscription({
        subscriber,
        subscribedTo: userToSubscribe._id,
    });

    await newSubscription.save();
    return res.status(200).json({ message: "Successfully subscribed" });
});


const unSubscribe = asyncHandler(async (req, res) => {
    const { subscribedTo } = req.params;
    const subscriber = req.user.id;

    if (!subscriber) {
        return res.status(400).json({ message: "Subscriber ID is required." });
    }

    const userToUnsubscribe = await User.findOne({ username: subscribedTo });

    if (!userToUnsubscribe) {
        return res.status(404).json({ message: "User not found." });
    }

    const existingSubscription = await Subscription.findOne({
        subscriber,
        subscribedTo: userToUnsubscribe._id,
    });

    if (!existingSubscription) {
        return res.status(400).json({ message: "Not subscribed yet." });
    }

    await Subscription.deleteOne({ _id: existingSubscription._id });

    return res.status(200).json({ message: "Successfully unsubscribed" });
});


const getSubscribersCount=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    console.log("userid in backend for subscriberr count:",userId);
     
    // find user by username
    const user= await User.findOne({_id:userId});
    if(!user){
        throw new ApiError(404,"User not found to count subscriber")
    }

    const subscribersCount= await Subscription.countDocuments({subscribedTo :user._id});
    return res.status(200).json({userId,subscribersCount});
})

const subscribedToCount= asyncHandler(async(req,res)=>{
    const {userId} =req.params;
    const subscribedToCount =await Subscription.countDocuments({subscriber:userId})
  return   res.status(200).
    json(new ApiResponse(200,{userId,subscribedToCount},"SubscribedToCount fetched successfully"))
})
const isSubscribed = async (req, res) => {
    try {
        const { userId, subscribedTo } = req.params;
        console.log("userId is",userId);
        console.log("subscribed to is :",subscribedTo);
        const subscription = await Subscription.findOne({ subscriber: userId, subscribedTo });

        res.json({ isSubscribed: !!subscription });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};




export  {Subscribe,unSubscribe,getSubscribersCount,subscribedToCount,isSubscribed}