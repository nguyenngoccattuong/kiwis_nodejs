const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlanLocationModel {
  async createPlanLocation(planId, data) {
    return await prisma.planLocation.create({
      data: data,
    });
  }

  async findPlanLocationById(planLocationId) {
    return await prisma.planLocation.findUnique({
      where: { planLocationId: planLocationId },
    });
  }

  async updatePlanLocation(planLocationId, data) {
    return await prisma.planLocation.update({
      where: { planLocationId: planLocationId },
      data: data,
    });
  }

  async deletePlanLocation(planLocationId) {
    return await prisma.planLocation.delete({
      where: { planLocationId: planLocationId },
    });
  }

  async findAllPlanLocationsByPlanId(planId) {
    return await prisma.planLocation.findMany({
      where: { planId: planId },
    });
  }

  async setPlanLocationCompleted(planLocationId) {
    return await prisma.planLocation.update({
      where: { planLocationId: planLocationId },
      data: { isCompleted: true },
    });
  }
}

module.exports = PlanLocationModel;
