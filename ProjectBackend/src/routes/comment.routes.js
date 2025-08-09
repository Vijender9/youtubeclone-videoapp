import express from "express"
import { addComment, deleteComment, getComments } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router= express.Router();
router.post("/",verifyJWT,addComment);
router.get("/:videoId",getComments);
router.delete("/:id", verifyJWT,deleteComment)
export default router;