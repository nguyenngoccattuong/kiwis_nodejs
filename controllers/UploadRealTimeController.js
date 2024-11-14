const UserService = require("../services/user.service");
const Controller = require("./Controller");
const CloudinaryService = require("../services/cloudinary.service");
const UploadRealTimeService = require("../services/uploadRealTime.service");
const Validation = require("../helper/Validation");
const { CloudinaryFolder } = require("../enum/cloudinary.enum");

const validate = new Validation();
const cloudinaryService = new CloudinaryService();
const uploadRealTimeService = new UploadRealTimeService();
class UploadRealTimeController extends Controller {
  constructor(req, res, next) {
    super(req, res, next);
  }

  async uploadRealTime() {
    try {
      const { title, description } = this.req.body;
      const file = this.req.file;

      validate.validateImage(file);

      const storageUpload = await cloudinaryService.uploadFile(
        file,
        CloudinaryFolder.post,
        "image"
      );

      const uploadRealTime = await uploadRealTimeService.uploadRealTime({
        title,
        description,
        fileId: storageUpload.id,
      });
      return this.response(200, uploadRealTime);
    } catch (error) {
      return this.response(500, error.message);
    }
  }
}

module.exports = UploadRealTimeController;
