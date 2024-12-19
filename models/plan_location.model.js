const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlanLocationModel {
  async createPlanLocation(data) {
    return await prisma.planLocation.create({
      data: data,
      include: {
        plan: true,
      },
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

  async updateAllPlanLocation(planId, data) {
    return await prisma.planLocation.updateMany({
      where: { planId: planId },
      data: {
        p
      },
    });
  }

  async deleteAllPlanLocationsByPlanId(planId) {
    return await prisma.planLocation.deleteMany({
      where: { planId: planId },
    });
  }

  async createPlanLocations(planId, data) {
    const locations = data.map(location => ({
      ...location,
      planId,
    }));
    return await prisma.planLocation.createMany({
      data: locations,
    });
  }
}

module.exports = PlanLocationModel;
