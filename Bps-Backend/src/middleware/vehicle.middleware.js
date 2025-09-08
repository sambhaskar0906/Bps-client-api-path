
export const vehicleAccessFilter = (req, res, next) => {
  const user = req.user; 

  if (!user) {
    
    req.vehicleQueryFilter = { _id: null };
    return next();
  }

  if (user.role === "supervisor") {
    
    req.vehicleQueryFilter = { createdBy: user._id };
  } else if (user.role === "admin") {
    
    req.vehicleQueryFilter = {};
  } else {
   
    req.vehicleQueryFilter = { _id: null };
  }

  next();
};
