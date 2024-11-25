const PlanModel = require("../models/plan.model");
const GroupModel = require("../models/group.model");
const GroupMemberModel = require("../models/group_menber.model");
const PlanLocationModel = require("../models/plan_location.model");
const CloudinaryService = require("../services/cloudinary.service");
const CloudinaryFolder = require("../helper/cloudinary");
const RealTimePostModel = require("../models/realtime_post.model");
const PlanCostSharingModel = require("../models/plan_cost_sharing.model");
const BaseController = require("./base.controller");

class PlanController extends BaseController {
  constructor(req, res) {
    super(req, res);
    this.planModel = new PlanModel();
    this.groupModel = new GroupModel();
    this.groupMemberModel = new GroupMemberModel();
    this.planLocationModel = new PlanLocationModel();
    this.cloudinaryService = new CloudinaryService();
    this.realTimePostModel = new RealTimePostModel();
    this.planCostSharingModel = new PlanCostSharingModel();
  }

  async createPlan() {
    const userId = await this.authUserId();
    const { name, groupId, startDate, endDate, totalCost } = this.req.body;

    if (!name) {
      throw Error("Name is required");
    }

    if (totalCost && totalCost instanceof Number) {
      throw Error("Total cost must be numbers");
    }

    if (totalCost && totalCost < 0) {
      throw Error("Total cost must be greater than 0");
    }

    if (startDate && startDate instanceof Date) {
      throw Error("Start date must be a date");
    }

    if (endDate && endDate instanceof Date) {
      throw Error("End date must be a date");
    }

    if (startDate && endDate && startDate > endDate) {
      throw Error("Start date must be before end date");
    }

    if (groupId) {
      const group = await this.groupModel.findGroupById(groupId);
      if (!group) {
        throw Error("Group not found");
      }
    }

    const plan = await this.planModel.createPlan({
      createdById: userId,
      groupId,
      name,
      startDate,
      endDate,
      totalCost,
    });

    return this.response(200, plan);
  }

  async findAllPlansByUserId() {
    const userId = await this.authUserId();

    const plans = await this.planModel.findAllPlansByUserId(userId);

    return this.response(200, plans);
  }

  async findAllPlansByGroupId() {
    const userId = await this.authUserId();
    const { groupId } = this.req.params;

    const groupMember = await this.groupMemberModel.exitUserFromGroup(userId, groupId);
    if (!groupMember) {
      throw Error("You are not a member of this group");
    }

    const group = await this.groupModel.findGroupById(groupId);
    if (!group) {
      throw Error("Group not found");
    }

    const plans = await this.planModel.findAllPlansByGroupId(groupId);

    return this.response(200, plans);
  }

  async findPlanById() {
    const userId = await this.authUserId();
    const { planId } = this.req.params;

    const plan = await this._checkPlanAccess(planId, userId);

    return this.response(200, plan);
  }

  async updatePlan(planId) {
    const userId = await this.authUserId();
    const { name, startDate, endDate, totalCost } = this.req.body;

    await this._checkPlanAccess(planId, userId);

    if (!name) {
      throw Error("Name is required");
    }

    if (totalCost && totalCost instanceof Number) {
      throw Error("Total cost must be numbers");
    }

    if (totalCost && totalCost < 0) {
      throw Error("Total cost must be greater than 0");
    }

    if (startDate && startDate instanceof Date) {
      throw Error("Start date must be a date");
    }

    if (endDate && endDate instanceof Date) {
      throw Error("End date must be a date");
    }

    if (startDate && endDate && startDate > endDate) {
      throw Error("Start date must be before end date");
    }

    const plan = await this.planModel.updatePlan(planId, {
      name,
      startDate,
      endDate,
      totalCost,
    });

    return this.response(200, plan);
  }

  async deletePlan(planId) {
    const userId = await this.authUserId();
    
    const plan = await this._checkPlanAccess(planId, userId);
    
    if (plan.isCompleted) {
      throw Error("You can't delete a completed plan");
    }

    await this.planModel.deletePlan(planId);

    return this.response(200, "Delete plan successfully");
  }

  async setPlanCompleted(planId) {
    const userId = await this.authUserId();

    await this._checkPlanAccess(planId, userId);

    const plan = await this.planModel.updatePlan(planId, {
      isCompleted: true,
    });

    return this.response(200, plan);
  }

  // * The user accepts the plan
  async acceptGoToPlan(){}
  // Plan Location //
  async addPlanLocation(planId) {
    const userId = await this.authUserId();
    const { name, latitude, longitude, address, googlePlaceId, estimatedCost, estimatedTime } = this.req.body;

    await this._checkPlanAccess(planId, userId);

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

    if (estimatedTime && estimatedTime  < 0) {
      throw Error("Estimated time must be greater than 0");
    }

    if (estimatedCost && estimatedCost < 0) {
      throw Error("Estimated cost must be greater than 0");
    }

    const planLocation = await this.planLocationModel.createPlanLocation( {
      planId,
      name,
      latitude,
      longitude,
      address,
      googlePlaceId,
      estimatedCost,
      estimatedTime,
    });

    return this.response(200, planLocation);
  }

  async updatePlanLocation(planLocationId) {
    const userId = await this.authUserId();
    const { name, latitude, longitude, address, googlePlaceId, estimatedCost, estimatedTime } = this.req.body;

    const planLocation = await this.planLocationModel.findPlanLocationById(planLocationId);
    if(!planLocation){
      throw Error("Plan location not found");
    }

    await this._checkPlanAccess(planLocation.planId, userId);

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

    if (estimatedTime && estimatedTime  < 0) {
      throw Error("Estimated time must be greater than 0");
    }

    if (estimatedCost && estimatedCost < 0) {
      throw Error("Estimated cost must be greater than 0");
    }

    const result = await this.planLocationModel.updatePlanLocation(planLocationId, {
      name,
      latitude,
      longitude,
      address,
      googlePlaceId,
      estimatedCost,
      estimatedTime,
    });

    return this.response(200, result);
  }

  async deletePlanLocation(planLocationId) {
    // const userId = await this.authUserId();

    // await this._checkPlanAccess(planId, userId);

    // await this.planLocationModel.deletePlanLocation(planLocationId);

    // return this.response(200, "Delete plan location successfully");
  }

  // Realtime Image //
  async addRealtimeImageToPlan(planId) {
    const userId = await this.authUserId();
    const file = this.req.file;

    const plan = await this._checkPlanAccess(planId, userId);
    if (plan.isCompleted) {
      throw Error("You can't add realtime image to a completed plan");
    }

    if (!file) {
      throw Error("File is required");
    }

    const storageUpload = await this.cloudinaryService.uploadFile(
      file,
      CloudinaryFolder.plan,
      "image",
      null,
      false
    );

    const create = {
      planId,
      publicId: storageUpload.id,
      imageUrl: storageUpload.url,
      format: storageUpload.format,
      width: storageUpload.width,
      height: storageUpload.height,
      type: "realtime",
    }

    const realtimePost = await this.realTimePostModel.createRealtimePost(create);

    return this.response(200, realtimePost);
  }

  async deleteRealtimeImageFromPlan(realtimePostId) {
    const userId = await this.authUserId();

    const realtimePost = await this._checkPlanAccess(realtimePostId, userId);

    if (!realtimePost) {
      throw Error("Realtime post not found");
    }

    if (realtimePost.plan.isCompleted) {
      throw Error("You can't delete realtime image from a completed plan");
    }

    await this.realTimePostModel.deleteById(realtimePostId);

    return this.response(200, "Delete realtime image from plan successfully");
  }

  async reupRealtimeInGroup(){}

  // Cost sharing
  // Note*: Nhớ add sharedUser vào: Người trả tiền cho người chi
  async createPlanCostSharing(){
    const userId = await this.authUserId();
    const { planLocationId, amount , payerId, planId, note, sharedWith, individualShares} = this.req.body;

    const plan = await this._checkPlanAccess(planId, userId);

    if(planLocationId){
      const exitPlanLocation = await this.planLocationModel.findPlanLocationById(planLocationId);
      if(!exitPlanLocation){
        throw Error("Plan location not found");
      }
    }

    if(amount && amount < 0){
      throw Error("Amount must be greater than 0");
    }

    if(amount instanceof Number){
      throw Error("Amount must be a number");
    }

    const payer = payerId || userId;

    // 3. Xử lý theo loại chia tiền
    let finalAmount = amount; // Sẽ sử dụng để lưu trong CostSharing

    if (sharedWith === "group") {
      // Với `sharedWith = group`, `amount` là bắt buộc
      if (!amount || typeof amount !== "number" || amount <= 0) {
        throw new Error("Amount must be a positive number for group sharing");
      }
    } else if (sharedWith === "individuals") {
      // Với `sharedWith = individuals`, `individualShares` là bắt buộc
      if (!Array.isArray(individualShares) || individualShares.length === 0) {
        throw new Error("Individual shares must be a non-empty array");
      }

      // Tính tổng tiền từ `individualShares`
      finalAmount = individualShares.reduce((sum, share) => {
        if (!share.userId || typeof share.amount !== "number" || share.amount <= 0) {
          throw new Error("Each individual share must include a valid userId and positive amount");
        }
        return sum + share.amount;
      }, 0);
    } else {
      throw new Error("Invalid sharedWith value. Must be 'group' or 'individuals'");
    }

    const data = {
      planLocationId,
      amount: finalAmount,
      payerId: payer,
      planId,
      note,
      sharedWith,
      sharedUsers: sharedWith === "individuals" ? individualShares : [],
    };


    const planCostSharing = await this.planCostSharingModel.createPlanCostSharing(data);
      
    return this.response(200, planCostSharing);
  }

  async updatePlanCostSharing(){
  //   const userId = await this.authUserId();
  //   const { planCostSharingId, amount } = this.req.body;

  //   await this._checkPlanAccess(planId, userId);
  }

  async deletePlanCostSharing(){}

  async getAllCostSharingByPlanId(){}

  async getAllNotPaid(){}

  async getAllCostSharingByPlanLocationId(){}

  async addSharedUserToCostSharing(){}

  async removeUserSharedInCostSharing(){}

  // Shared user
  async updateSharedUserIsPaid(){}

  async updatePaidAllPlan(){}

  // Check Plan Access //
  async _checkPlanAccess(planId, userId) {
    const plan = await this.planModel.findPlanById(planId);
    if (!plan) {
      throw Error("Plan not found");
    }

    if(plan.groupId){
      const group = await this.groupModel.findGroupById(plan.groupId);
      const groupMember = await this.groupMemberModel.exitUserFromGroup(userId, group.groupId);
      if (plan.createdById !== userId && !groupMember) {
        throw Error("You can't access this plan");
      }
    }

    return plan;
  }
}

module.exports = PlanController;