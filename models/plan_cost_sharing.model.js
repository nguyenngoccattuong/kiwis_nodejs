const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlanCostSharingModel {
  async createPlanCostSharing(data){
    return await prisma.costSharing.create({
      data: data,
    });
  }

  async findCostSharingById(costShareId){
    return await prisma.costSharing.findUnique({
      where: { costShareId: costShareId },
    });
  }
}

module.exports = PlanCostSharingModel;
