const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class CloudinaryModel {
  constructor() {
    this.cloudinary = require("cloudinary").v2;
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Cloudinary upload file
   * @param {*} file
   * @param {*} folder
   * @param {*} resourceType
   * @returns {Promise<CloudinaryStorage>}
   */

  async uploadFile(file, folder, resourceType, public_id, destroy = false) {
    if(destroy){
      await this.destroyFile(public_id);
    }
    return await this.cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: folder,
    });
  }

  /**
   * Cloudinary destroy file
   * @param {*} publicId
   * @returns
   */
  async destroyFile(publicId) {
    return await this.cloudinary.uploader.destroy(publicId);
  }
}

module.exports = CloudinaryModel;
