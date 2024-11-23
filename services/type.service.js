class TypeService{
  async createType(data){
    return await prisma.type.create({data: data});
  }

  async findById(uid){
    return await prisma.type.findFirst({
      where: {
        id: uid,
      }
    });
  }

  async findAllByUserId(uid){
    return await prisma.type.findMany({
      where: {
        userId: uid,
      }
    });
  }

  async findAll(){
    return await prisma.type.findMany();
  }
}

module.exports = TypeService;