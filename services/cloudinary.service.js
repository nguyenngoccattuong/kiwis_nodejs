const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class CloudinaryService {
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
    const response = await this.cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: folder,
    });
    /// Destroy option
    if(destroy){
      await this.destroyFile(public_id);
    }
    const cloudinaryStorage = await prisma.cloudinaryStorage.create({
      data: {
        url: response.secure_url,
        assetId: response.asset_id,
        publicId: response.public_id,
      },
    });
    return cloudinaryStorage;
  }

  /**
   * Cloudinary destroy file
   * @param {*} publicId
   * @returns
   */
  destroyFile(publicId) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}

module.exports = CloudinaryService;
