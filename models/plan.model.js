const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlanModel {
  async createPlan(data) {
    return await prisma.plan.create({
      data: data,
      include: {
        createdBy: true,
        group: true,
        thumbnail: true,
        realtimeImages: true,
        planLocations: true,
        planCosts: true,
      },
    });
  }

  async findAllPlansByUserId(userId) {
    return await prisma.plan.findMany({
      where: { createdById: userId },
    });
  }

  async findAllPlansByGroupId(groupId) {
    return await prisma.plan.findMany({
      where: { groupId: groupId },
    });
  }

  async findPlanById(planId) {
    return await prisma.plan.findUnique({
      where: {
        planId: planId,
      },
      include: {
        createdBy: true,
        group: true,
        thumbnail: true,
        realtimeImages: true,
        planLocations: true,
        planCosts: true,
      },
    });
  }

  async updatePlan(planId, data) {
    return await prisma.plan.update({
      where: { planId: planId },
      data: data,
      include: {
        createdBy: true,
        group: true,
        thumbnail: true,
        realtimeImages: true,
        planLocations: true,
        planCosts: true,
      },
    });
  }

  async deletePlan(planId) {
    return await prisma.plan.delete({
      where: { planId: planId },
      include: {
        createdBy: true,
        group: true,
        thumbnail: true,
        realtimeImages: true,
        planLocations: true,
        planCosts: true,
      },
    });
  }
}

module.exports = PlanModel;