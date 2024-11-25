const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class CloudinaryImageModel {
  async createCloudinaryImage(data){
    return await prisma.cloudinaryImage.create({
      data,
    });
  }

  async deleteCloudinaryImage(id){
    return await prisma.cloudinaryImage.delete({
      where: {
        cloudinaryImageId: id,
      },
    });
  }
}

module.exports = CloudinaryImageModel;
