import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideo ,getVideos,getVideoById,deleteVideo,updateVideo,getMyUploads,increaseViews} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { likeVideo, dislikeVideo } from "../controllers/video.controller.js";


const router = Router() 
router.route("/upload").post( verifyJWT,upload.single("videoFile"),uploadVideo)
router.route("/getVideos").get(getVideos)
router.route("/getVideo-single/:id").get(getVideoById)
router.route("/update-video").patch( verifyJWT ,updateVideo)
router.route("/delete-video/:id").delete( verifyJWT,deleteVideo)
router.put("/like/:id", verifyJWT, likeVideo);
router.put("/dislike/:id", verifyJWT, dislikeVideo);
router.get("/my-uploads", verifyJWT, getMyUploads);
router.put("/views/:videoId", increaseViews);

export default router 