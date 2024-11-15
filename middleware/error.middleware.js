const AppError = require("../utils/app_error");

const errorHandle = (error, req, res, next) =>{
  console.log(error);
  if(error instanceof AppError){
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      message: "Error",
      error: error,
    });
  }

  return res.status(400).send(error.message);
}

module.exports = errorHandle;