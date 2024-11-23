const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class RouteService{
  async createRoute(data){
    return await prisma.route.create({data: data});
  }

  async findById(uid){
    return await prisma.route.findFirst({where: {
      id: uid,
    }});
  }

  async findByUserId(uid){
    return await prisma.route.findMany({
      where: {
        id: uid
      }
    });
  }

  async updateById(uid, data){
    return await prisma.route.update({
      data: data,
      where: {
        id: uid,
      }
    });
  }

  async deleteById(uid){
    return await prisma.route.deleteMany({
      where: {
        id: uid,
      }
    });
  }
}

module.exports = RouteService;