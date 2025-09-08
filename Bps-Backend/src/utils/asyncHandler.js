const asyncHandler = (requestHandler) =>{
    return  (req,res,next)=>{
         Promise
         .resolve(requestHandler(req,res,next))//reslove
         .catch((err)=>next(err))//reject
 }
 }
 export {asyncHandler}