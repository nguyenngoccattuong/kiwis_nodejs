const AppError = require("../utils/app_error");

const errorHandle = (error, req, res, next) =>{
  console.log(error);
  if(error instanceof AppError){
    return res.status(200).json({
      statusCode: error.statusCode,
      success: false,
      message: "Error",
      error: error,
    });
  }

  if (error instanceof Error) {
    return res.status(200).json({
      statusCode: 400,
      success: false,
      message: "Error",
      error: error.message,
    });
  }

  return res.status(200).send({
    statusCode: 400,
    success: false,
    message: "Error",
    error: "Server Error",
  });
}

module.exports = errorHandle;