import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";




const UserSchema=new mongoose.Schema({
   username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true,//for searching in mongodb
   },
   email:{
    type:String,
    required :true,
    unique:true,
    lowercase:true,
    trim:true,
  },

   fullname:{
    type:String,
    required:true,
    trim:true,
    index:true,
   },
   avatar:{
     type:String,//cloudinary url
     required:true,
   },
   coverimage:{
        type:String,//cloudinary url

   },
   watchHistory:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Videos",
    }
   ],
   password:{
    type:String,
    required:[true,'Password is required']

   },
   refreshToken:{
      type:String
   },




},{timestamps:true})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();//this password field is going to encrypt
    // when we change password or first time when we save .we dont want this to change whrn profile or other things gets updated
    this.password= await bcrypt.hash(this.password,10)
    next()
})//here dont write as arrow function coz here its not know this reference

UserSchema.methods.isPasswordCorrect=async function
(password){
    // console.log("enterd password:",password);
    // console.log("database password:",this.password);
    return await bcrypt.compare(password,this.password)   //compare return true or false
}

UserSchema.methods.generateAccessToken=function(){
     return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User=mongoose.model("User",UserSchema)




// brcypt libraray->for passwrod encrypt compare decrypt in mongo db 
// research more on thi one  js and other