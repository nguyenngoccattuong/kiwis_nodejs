const BaseController = require("./base.controller");
const CloudinaryService = require("../services/cloudinary.service");
const RealTimePostModel = require("../models/realtime_post.model");
const Validation = require("../helper/validation");
const { CloudinaryFolder } = require("../enum/cloudinary.enum");

const validate = new Validation();
const cloudinaryService = new CloudinaryService();
const uploadRealTimeModel = new RealTimePostModel();
class UploadRealTimeController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next);
  }

  async uploadRealTime() {
    const { title, description } = this.req.body;
    const file = this.req.file;

    validate.validateImage(file);

    const storageUpload = await cloudinaryService.uploadFile(
      file,
      CloudinaryFolder.post,
      "image"
    );

    const uploadRealTime = await uploadRealTimeModel.uploadRealTime({
      title,
      description,
      fileId: storageUpload.id,
    });
    return this.response(200, uploadRealTime);
  }

  async deleteUploadRealtime() {}
}

module.exports = UploadRealTimeController;
