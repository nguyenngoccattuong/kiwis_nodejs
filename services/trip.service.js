const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class TripService{
  async createTrip(data){
    return await prisma.trip.create({data: data});
  }

  async findById(uid){
    return await prisma.trip.findFirst({where: {id: uid}});
  }

  async findByUser(uid){
    return await prisma.trip.findMany({where: {userId: uid}});
  }

  async findByGroup(gid){
    return await prisma.trip.findMany({where: {groupId: gid}});
  }

  async updateById(uid, data){
    return await prisma.trip.update({
      data: data,
      where: {
        id: uid,
      }
    });
  }

  async deleteById(uid){
    return await prisma.trip.delete({
      where: {
        id: uid,
      }
    });
  }
}

module.exports = TripService;