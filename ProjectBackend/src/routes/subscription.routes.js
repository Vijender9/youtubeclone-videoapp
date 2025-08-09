import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Subscribe,unSubscribe,getSubscribersCount, subscribedToCount,isSubscribed } from "../controllers/Subscription.controller.js"

const router=express.Router();

// Subscribe to a user
router.post("/subscribe/:subscribedTo", verifyJWT, Subscribe); 

// Unsubscribe from a user
router.delete("/unsubscribe/:subscribedTo", verifyJWT, unSubscribe);

// Get count of subscribers (followers)
router.get("/subscribers/count/:userId", getSubscribersCount);

// Get count of subscribedTo (following)
router.get("/subscribedTo/count/:userId", subscribedToCount);

router.get("/isSubscribed/:userId/:subscribedTo", verifyJWT, isSubscribed);


export default router;