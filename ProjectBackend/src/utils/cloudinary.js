import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary =async (localFilePath)=>{
    try{
      if(!localFilePath) return null
      //upload file on cloudinary
       const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
      // file has been uploaded successfully
      console.log("file is uploaded on cloudinary",response.url);
      console.log(" full response",response);
      fs.unlinkSync(localFilePath);
      return response;
    } catch(error){
          fs.unlinkSync(localFilePath)//remove the 
          //locally saved temporary file as the upload operation got failed
          return null;
    }
}

// const deleteFromCloudinary = async (imageUrl) => {
//   try {
//       if (!imageUrl) return false; // If no URL, nothing to delete

//       // Extract public ID from URL
//       const publicId = imageUrl.split("/").pop().split(".")[0]; 

//       // Delete the image from Cloudinary
//       await cloudinary.uploader.destroy(publicId);

//       console.log(`Deleted from Cloudinary: ${imageUrl}`);
//       return true;
//   } catch (error) {
//       console.error("Cloudinary Delete Error:", error);
//       return false;
//   }
// };


export{uploadOnCloudinary}