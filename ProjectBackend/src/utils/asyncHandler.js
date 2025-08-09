const asyncHandler = (requestHandler)=>{
  return(req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
  }

}

export {asyncHandler}





//high order function ->can take function as a parameter
// or can return a function treat as a variable

// just writing
// IIFE:immediately invoked function expression
//IIFE is a function that is called immediately as soon as it is defined







// const asyncHandler=()=>{}
// const asyncHandler=()=>{()=>{}} // can write this


// using try catch fn
// const  asyncHandler= (fn)=>async (req,res,next)=>{
//    try{
//            await fn(req,res,next)
//    }
//    catch(error){
//        res.status(error.code ||500).json({
//         success:false,
//         message:error.message
//        })
//    }
// }