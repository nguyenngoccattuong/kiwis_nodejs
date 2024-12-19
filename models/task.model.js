const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class TaskModel {  
  async createTask(task) {
    const newTask = await prisma.task.create({
      data: task,
    });
    return newTask;
  }

  async getTaskById(taskId) {
    const task = await prisma.task.findUnique({
      where: { taskId },
    });
    return task;
  }

  async updateTask(taskId, task) {
    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: task,
    });
    return updatedTask;
  }

  async deleteTask(taskId) {
    const deletedTask = await prisma.task.delete({
      where: { taskId },
    });
    return deletedTask;
  }

  async getTasksByPlanId(planId) {
    const tasks = await prisma.task.findMany({
      where: { planId },
    });
    return tasks;
  }

  async getAllTasksHaveLocation() {
    const tasks = await prisma.task.findMany({
      where: { planLocationId: { not: null } },
    });
    return tasks;
  }
}

module.exports = TaskModel;
