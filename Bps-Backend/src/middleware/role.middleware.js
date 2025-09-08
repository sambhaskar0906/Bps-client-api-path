
export const roleAccessFilter = (req, res, next) => {
  const user = req.user;

  if (!user) {

    req.roleQueryFilter = { _id: null };
    return next();
  }

  if (user.role === "supervisor") {

    req.roleQueryFilter = { createdBy: user._id };
  } else if (user.role === "admin") {

    req.roleQueryFilter = {};
  } else {

    req.roleQueryFilter = { _id: null };
  }

  next();
};
