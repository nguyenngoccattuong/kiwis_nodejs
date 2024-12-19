const TaskModel = require("../models/task.model");
const PlanLocationModel = require("../models/plan_location.model");
class TaskController {
  constructor() {
    this.taskModel = new TaskModel();
    this.planLocationModel = new PlanLocationModel();
  }

  async createTask(req, res) {
    const task = req.body;
    const newTask = await this.taskModel.createTask(task);
    res.status(201).json(newTask);
  }

  async getTaskById(req, res) {
    const taskId = req.params.taskId;
    const task = await this.taskModel.getTaskById(taskId);
    res.status(200).json(task);
  }

  async updateTask(req, res) {
    const taskId = req.params.taskId;
    const task = req.body;
    const updatedTask = await this.taskModel.updateTask(taskId, task);
    res.status(200).json(updatedTask);
  }

  async deleteTask(req, res) {
    const taskId = req.params.taskId;
    const deletedTask = await this.taskModel.deleteTask(taskId);
    res.status(200).json(deletedTask);
  }

  async getTasksByPlanId(req, res) {
    const planId = req.params.planId;
    const tasks = await this.taskModel.getTasksByPlanId(planId);
    res.status(200).json(tasks);
  }

  async getAllTasksHaveLocation(req, res) {
    const tasks = await this.taskModel.getAllTasksHaveLocation();
    res.status(200).json(tasks);
  }

  // Plan Location //
  async addPlanLocation(planId) {
    const userId = await this.authUserId();
    const {
      title,
      description,
      startDate,
      endDate,
      totalCost,
      status,
      name,
      latitude,
      longitude,
      address,
      googlePlaceId,
      estimatedCost,
      estimatedTime,
    } = this.req.body;

    if (latitude && latitude instanceof Number) {
      throw Error("Latitude must be numbers");
    }

    if (longitude && longitude instanceof Number) {
      throw Error("Longitude must be numbers");
    }

    if (estimatedCost && estimatedCost instanceof Number) {
      throw Error("Estimated cost must be numbers");
    }

    if (estimatedTime && estimatedTime instanceof Number) {
      throw Error("Estimated time must be numbers");
    }

    if (estimatedTime && estimatedTime < 0) {
      throw Error("Estimated time must be greater than 0");
    }

    if (estimatedCost && estimatedCost < 0) {
      throw Error("Estimated cost must be greater than 0");
    }

    const planLocation = await this.planLocationModel.createPlanLocation({
      name,
      latitude,
      longitude,
      address,
      googlePlaceId,
      estimatedCost,
      estimatedTime,
    });

    const task = await this.taskModel.createTask({
      planId,
      planLocationId: planLocation.planLocationId,
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      status: status,
      totalCost: totalCost,
    });

    return this.response(200, task);
  }

  async updateTaskPlanLocation(planLocationId) {
    const userId = await this.authUserId();
    const {
      name,
      latitude,
      longitude,
      address,
      googlePlaceId,
      estimatedCost,
      estimatedTime,
    } = this.req.body;

    const planLocation = await this.planLocationModel.findPlanLocationById(
      planLocationId
    );

    if (!planLocation) {
      throw Error("Plan location not found");
    }

    if (latitude && latitude instanceof Number) {
      throw Error("Latitude must be numbers");
    }

    if (longitude && longitude instanceof Number) {
      throw Error("Longitude must be numbers");
    }

    if (estimatedCost && estimatedCost instanceof Number) {
      throw Error("Estimated cost must be numbers");
    }

    if (estimatedTime && estimatedTime instanceof Number) {
      throw Error("Estimated time must be numbers");
    }

    if (estimatedTime && estimatedTime < 0) {
      throw Error("Estimated time must be greater than 0");
    }

    if (estimatedCost && estimatedCost < 0) {
      throw Error("Estimated cost must be greater than 0");
    }

    await this.planLocationModel.updatePlanLocation(planLocationId, {
      name,
      latitude,
      longitude,
      address,
      googlePlaceId,
      estimatedCost,
      estimatedTime,
    });

    return this.response(200, "Update plan location successfully");
  }

  async deletePlanLocation(planLocationId) {
    const userId = await this.authUserId();

    const planLocation = await this.planLocationModel.findPlanLocationById(
      planLocationId
    );

    await this._checkPlanAccess(planLocation.planId, userId);

    await this.planLocationModel.deletePlanLocation(planLocationId);

    return this.response(200, "Delete plan location successfully");
  }
}
