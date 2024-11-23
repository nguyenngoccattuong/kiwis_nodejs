const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class MapSettingService{
  async createMapSetting(data){
    return await prisma.mapSetting.create({data: data});
  }

  async findById(uid){
    return await prisma.mapSetting.findFirst({where: {
      id: uid,
    }});
  }
}

module.exports = MapSettingService;