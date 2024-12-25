const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlanModel {
  async createPlan(data) {
    return await prisma.plan.create({
      data: data,
      include: {
        createdBy: {
          include: {
            avatar: true,
          },
        },
        group: true,
        thumbnail: true,
        realtimeImages: true,
        planCosts: true,
        tasks: true,
      },
    });
  }

  async findAllPlansByUserId(userId) {
    return await prisma.plan.findMany({
      where: { createdById: userId },
      include: {
        createdBy: true,
        group: {
          include: {
            members: {
              include: {
                user: {
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
              },
            },
          },
        },
        thumbnail: true,
        tasks: {
          include: {
            planLocation: true,
            images: true,
          },
        },
      },
    });
  }

  async findAllPlansByGroupId(groupId) {
    return await prisma.plan.findMany({
      where: { groupId: groupId },
      include: {
        createdBy: true,
        group: true,
        thumbnail: true,
        realtimeImages: true,
        planCosts: true,
        tasks: true,
      },
    });
  }

  async findPlanById(planId) {
    return await prisma.plan.findUnique({
      where: {
        planId: planId,
      },
      include: {
        createdBy: true,
        group: {
          include: {
            members: true,
          },
        },
        thumbnail: true,
        realtimeImages: true,
        tasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
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
        planCosts: true,
        tasks: true,
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
        planCosts: true,
        tasks: true,
      },
    });
  }
}

module.exports = PlanModel;