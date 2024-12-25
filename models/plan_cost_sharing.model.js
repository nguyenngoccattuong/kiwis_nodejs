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

  async findCostSharingByPlanId(planId){
    return await prisma.costSharing.findMany({
      where: { planId: planId },
      include: {
        payer: {
          omit: {
            avatarId: true,
            passwordHash: true,
            isActive: true,
            deletedAt: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
          include: {
            avatar: true,
          },
        },
        sharedUsers: true,
      },
    });
  }

  async deletePlanCostSharing(costShareId) {
    return await prisma.costSharing.delete({
      where: { costShareId: costShareId },
    });
  } 

  async updatePlanCostSharing(costShareId, data) {
    return await prisma.costSharing.update({
      where: { costShareId: costShareId },
      data: data,
    });
  } 
}

module.exports = PlanCostSharingModel;
