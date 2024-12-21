const TaskModel = require("../models/task.model");
const PlanLocationModel = require("../models/plan_location.model");
const BaseController = require("./base.controller");
class TaskController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next);
    this.taskModel = new TaskModel();
    this.planLocationModel = new PlanLocationModel();
  }

  /*
    Request example:
    {
      "title": "Task 1",
      "description": "Description 1",
      "startDate": "2024-12-19 14:43:17.895",
      "endDate": "2024-12-19 14:43:17.895",
      "status": "TODO",
      "totalCost": 100,
      "planId": "planId"
    }
  */
  async createTask() {
    const {
      title,
      description,
      startDate,
      endDate,
      status,
      totalCost,
      planId,
    } = this.req.body;

    const { name, latitude, longitude, address, estimatedCost, estimatedTime } = this.req.body.planLocation;

    if (!title) {
      throw Error("Title is required");
    }

    if (!description) {
      throw Error("Description is required");
    }

    if (!startDate) {
      throw Error("Start date is required");
    }

    if (!endDate) {
      throw Error("End date is required");
    }

    if (!status) {
      throw Error("Status is required");
    }

    if (!planId) {
      throw Error("Plan id is required");
    }

    const parseDate = (date) => {
      const parsed = Date.parse(date);
      if (isNaN(parsed)) {
        throw Error(`Invalid date format: ${date}`);
      }
      return new Date(parsed);
    };

    const formattedStartDate = startDate ? parseDate(startDate) : null;
    const formattedEndDate = endDate ? parseDate(endDate) : null;

    if(formattedStartDate > formattedEndDate) {
      throw Error("Start date must be less than end date");
    }

    let planLocation;
    if(name && latitude && longitude && address && estimatedCost && estimatedTime) {
      planLocation = await this.planLocationModel.createPlanLocation({name, latitude, longitude, address, estimatedCost, estimatedTime});
    }

    const newTask = await this.taskModel.createTask({
      title,
      description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status,
      totalCost,
      planId,
      planLocationId: planLocation.planLocationId,
    });
    return this.response(200, newTask);
  }

  async getTaskById() {
    const taskId = this.req.params.taskId;
    const task = await this.taskModel.getTaskById(taskId);
    return this.response(200, task);
  }

  async updateTask() {
    const taskId = this.req.params.taskId;
    const task = this.req.body;
    const updatedTask = await this.taskModel.updateTask(taskId, task);
    return this.response(200, updatedTask);
  }

  async deleteTask() {
    const taskId = this.req.params.taskId;
    const deletedTask = await this.taskModel.deleteTask(taskId);
    return this.response(200, deletedTask);
  }

  async getTasksByPlanId() {
    const planId = this.req.params.planId;
    const tasks = await this.taskModel.getTasksByPlanId(planId);
    return this.response(200, tasks);
  }

  async getAllTasksHaveLocation() {
    const tasks = await this.taskModel.getAllTasksHaveLocation();
    return this.response(200, tasks);
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

    const planLocationUpdated = await this.planLocationModel.updatePlanLocation(
      planLocationId,
      {
        name,
        latitude,
        longitude,
        address,
        googlePlaceId,
        estimatedCost,
        estimatedTime,
      }
    );

    const task = await this.taskModel.findTaskById(planLocationId);

    return this.response(200, task);
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

module.exports = TaskController;
