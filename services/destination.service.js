const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Destination{
  async createDestination(data){
    return await prisma.destination.create({data: data});
  }

  async findById(id){
    return await prisma.destination.findFirst({
      where: {
        id: id
      }
    });
  }

  async findAllByUserId(uid){
    return await prisma.destination.findFirst({
      where:{
        
      }
    });
  }
}

module.exports = DestinationService;