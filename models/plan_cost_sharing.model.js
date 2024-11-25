const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlanCostSharingModel {
  async createPlanCostSharing(data){
    return await prisma.costSharing.create({
      data: data,
    });
  }
}

module.exports = PlanCostSharingModel;
