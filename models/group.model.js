class GroupService {
  
  async createGroup(name, createdById){
    return await prisma.group.create({
      data: {
        name,
        createdById,
      },
    });
  }

  async findAllGroupsByUserId(userId){
    return await prisma.group.findMany({
      where: {
        createdById: userId,
      },
    });
  }
}

module.exports = GroupService;
