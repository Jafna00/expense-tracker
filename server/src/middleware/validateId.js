import mongoose from "mongoose";

const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    return next(new Error("Invalid expense id"));
  }
  next();
};

export default validateId;