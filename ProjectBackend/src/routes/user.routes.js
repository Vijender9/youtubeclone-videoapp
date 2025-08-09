import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,storeWatchHistory,clearWatchHistory,deleteFromWatchHistory
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
  //middleware
  upload.fields([
    {
      name: "avatar",
      maxCount: 2
    },
    {
      name: "coverImage",
      maxCount: 1
    }


  ]),
  registerUser)

router.route("/login").post(loginUser)
//  loginUser
//secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
//params is bit different
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)
router.route("/store-history").post(verifyJWT, storeWatchHistory);
router.route("/watch-history/:videoId").delete(verifyJWT, deleteFromWatchHistory);
router.route("/watch-history/clear").delete(verifyJWT, clearWatchHistory);


export default router