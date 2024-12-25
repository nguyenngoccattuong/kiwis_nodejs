const PlanModel = require("../models/plan.model");
const GroupModel = require("../models/group.model");
const GroupMemberModel = require("../models/group_menber.model");
const PlanLocationModel = require("../models/plan_location.model");
const CloudinaryService = require("../services/cloudinary.service");
const CloudinaryFolder = require("../enum/cloudinary.enum");
const RealTimePostModel = require("../models/realtime_post.model");
const PlanCostSharingModel = require("../models/plan_cost_sharing.model");
const BaseController = require("./base.controller");
const CloudinaryImageModel = require("../models/cloudinary_image.model");
const NotificationService = require("../services/notification.service");
const {io} = require("../app");
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
    this.cloudinaryImageModel = new CloudinaryImageModel();
  }

  async createPlan() {
    const userId = await this.authUserId();
    const file = this.req.file;
    const { name, groupId, startDate, endDate, totalCost, description } =
      this.req.body;
  
    // Validate 'name'
    if (!name) {
      throw Error("Name is required");
    }
  
    // Convert 'totalCost' to an integer
    let parsedTotalCost = totalCost ? parseInt(totalCost, 10) : null;
    if (totalCost && (isNaN(parsedTotalCost) || typeof parsedTotalCost !== "number")) {
      throw Error("Invalid total cost. It must be a valid number.");
    }
  
    // Ensure 'totalCost' is positive
    if (parsedTotalCost && parsedTotalCost < 0) {
      throw Error("Total cost must be greater than or equal to 0");
    }
  
    // Date parsing and validation
    const parseDate = (date) => {
      const parsed = Date.parse(date);
      if (isNaN(parsed)) {
        throw Error(`Invalid date format: ${date}`);
      }
      return new Date(parsed);
    };
  
    const formattedStartDate = startDate ? parseDate(startDate) : null;
    const formattedEndDate = endDate ? parseDate(endDate) : null;
  
    if (
      formattedStartDate &&
      formattedEndDate &&
      formattedStartDate > formattedEndDate
    ) {
      throw Error("Start date must be before end date");
    }
  
    if (groupId) {
      const group = await this.groupModel.findGroupById(groupId);
      if (!group) {
        throw Error("Group not found");
      }
    }
  
    let cloudinaryImage;
    if (file) {
      const uploaded = await this.cloudinaryService.uploadFile(file);
      cloudinaryImage = await this.cloudinaryImageModel.createCloudinaryImage({
        publicId: uploaded.public_id,
        imageUrl: uploaded.secure_url,
        type: "thumbnail",
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
      });
    }
  
    // Create the plan
    const plan = await this.planModel.createPlan({
      createdById: userId,
      groupId: groupId == "" ? null : groupId,
      name,
      description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      totalCost: parsedTotalCost,
      thumbnailId: cloudinaryImage?.cloudinaryImageId,
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

    const groupMember = await this.groupMemberModel.existUserFromGroup(
      userId,
      groupId
    );
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
    let { name, startDate, endDate, totalCost, description } = this.req.body;
    const file = this.req.file;


    await this._checkPlanAccess(planId, userId);

    if (!name) {
      throw Error("Name is required");
    }

    if (totalCost) {
      totalCost = Number(totalCost);
      if (isNaN(totalCost)) {
        throw Error("Total cost must be a valid number");
      }
    }

    if (totalCost && totalCost < 0) {
      throw Error("Total cost must be greater than 0");
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

    if (
      formattedStartDate &&
      formattedEndDate &&
      formattedStartDate > formattedEndDate
    ) {
      throw Error("Start date must be before end date");
    }

    const getPlan = await this.planModel.findPlanById(planId);

    if (getPlan.thumbnailId) {
      await this.cloudinaryService.destroyFile(getPlan.thumbnailId);
    }
    let cloudinaryImage;
    if (file) {
      const uploaded = await this.cloudinaryService.uploadFile(file);
      cloudinaryImage = await this.cloudinaryImageModel.createCloudinaryImage({
        publicId: uploaded.public_id,
        imageUrl: uploaded.secure_url,
        type: "thumbnail",
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
      });
    }

    const plan = await this.planModel.updatePlan(planId, {
      name,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      totalCost,
      description,
      thumbnailId: cloudinaryImage?.cloudinaryImageId,
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
  async acceptGoToPlan() {}

  // Realtime Image //
  async addRealtimeImageToPlan(planId) {
    const userId = await this.authUserId();
    const file = this.req.file;

    if (!file) {
      throw Error("File is required");
    }

    const plan = await this._checkPlanAccess(planId, userId);
    if (plan.isCompleted) {
      throw Error("You can't add realtime image to a completed plan");
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
    };

    const realtimePost = await this.realTimePostModel.createRealtimePost(
      create
    );

    return this.response(200, realtimePost);
  }

  async deleteRealtimeImageFromPlan(realtimePostId) {
    const userId = await this.authUserId();

    // Lấy realtime post trước
    const realtimePost = await this.realTimePostModel.findById(realtimePostId);
    if (!realtimePost) {
      throw Error("Realtime post not found");
    }

    // Kiểm tra quyền truy cập plan
    const plan = await this._checkPlanAccess(realtimePost.planId, userId);
    if (plan.isCompleted) {
      throw Error("You can't delete realtime image from a completed plan");
    }

    // Xóa ảnh
    await this.realTimePostModel.deleteById(realtimePostId);

    return this.response(200, "Delete realtime image from plan successfully");
  }

  async reupRealtimeInGroup() {}

  // Cost sharing
  // Note*: Nhớ add sharedUser vào: Người trả tiền cho người chi
  async createPlanCostSharing(planId) {
    const userId = await this.authUserId();
    const {
      amount,
      payerId,
      note,
      title,
      sharedWith,
      individualShares,
    } = this.req.body;
  
    const plan = await this._checkPlanAccess(planId, userId);
  
    if (amount && amount < 0) {
      throw Error("Amount must be greater than 0");
    }
  
    if (amount instanceof Number) {
      throw Error("Amount must be a number");
    }
  
    const payer = payerId || userId;
  
    // 3. Xử lý theo loại chia tiền
    let finalAmount = amount;
  
    if (sharedWith === "GROUP") {
      if (sharedWith === "GROUP") {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          throw new Error("Amount must be a positive number for group sharing");
        }
        finalAmount = Number(amount); 
      }
    } else if (sharedWith === "INDIVIDUALS") {
      if (!Array.isArray(individualShares) || individualShares.length === 0) {
        throw new Error("Individual shares must be a non-empty array");
      }
  
      finalAmount = individualShares.reduce((sum, share) => {
        if (
          !share.userId ||
          typeof share.amount !== "number" ||
          share.amount <= 0
        ) {
          throw new Error(
            "Each individual share must include a valid userId and positive amount"
          );
        }
        return sum + share.amount;
      }, 0);
    } else {
      throw new Error(
        "Invalid sharedWith value. Must be 'group' or 'individuals'"
      );
    }
  
    const data = {
      title,
      amount: finalAmount,
      note,
      payerId,
      planId,
      sharedWith,
      sharedUsers: {
        create: individualShares.map((share) => ({
          user: { connect: { userId: share.userId } },
          amount: share.amount,
        })),
      },
    };
  
    // Create the cost sharing record in the database
    const planCostSharing =
      await this.planCostSharingModel.createPlanCostSharing(data);
  
    return this.response(200, planCostSharing);
  }
  

  async updatePlanCostSharing() {
    const userId = await this.authUserId();
    const {
      costShareId,
      planLocationId,
      amount,
      payerId,
      planId,
      note,
      title,
      sharedWith,
      individualShares,
    } = this.req.body;

    await this._checkPlanAccess(planId, userId);

    const existingCostShare =
      await this.planCostSharingModel.findCostSharingById(costShareId);
    if (!existingCostShare) {
      throw new Error("Cost sharing record not found");
    }

    if (planLocationId) {
      const exitPlanLocation =
        await this.planLocationModel.findPlanLocationById(planLocationId);
      if (!exitPlanLocation) {
        throw new Error("Plan location not found");
      }
    }

    let finalAmount = amount || existingCostShare.amount;

    if (sharedWith === "group") {
      if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
        throw new Error("Amount must be a positive number for group sharing");
      }
    } else if (sharedWith === "individuals") {
      if (!Array.isArray(individualShares) || individualShares.length === 0) {
        throw new Error("Individual shares must be a non-empty array");
      }

      finalAmount = individualShares.reduce((sum, share) => {
        if (
          !share.userId ||
          typeof share.amount !== "number" ||
          share.amount <= 0
        ) {
          throw new Error(
            "Each individual share must include a valid userId and positive amount"
          );
        }
        return sum + share.amount;
      }, 0);
    } else {
      throw new Error(
        "Invalid sharedWith value. Must be 'group' or 'individuals'"
      );
    }

    const data = {
      planLocationId: planLocationId || existingCostShare.planLocationId,
      amount: finalAmount,
      payerId: payerId || existingCostShare.payerId,
      note: note || existingCostShare.note,
      sharedWith: sharedWith || existingCostShare.sharedWith,
    };

    const updatedCostSharing =
      await this.planCostSharingModel.updatePlanCostSharing(costShareId, data);

    if (sharedWith === "individuals") {
      // Xóa các bản ghi `SharedUser` hiện tại
      await this.planCostSharingModel.deleteSharedUsersByCostShareId(
        costShareId
      );

      // Thêm mới danh sách `SharedUser`
      await this.planCostSharingModel.createSharedUsers(
        costShareId,
        individualShares.map((share) => ({
          userId: share.userId,
          amount: share.amount,
        }))
      );
    }

    // 8. Trả về kết quả
    return this.response(200, updatedCostSharing);
  }

  async setPlanStart(planId) {
    const userId = await this.authUserId();

    const plan = await this.planModel.findPlanById(planId);
    if (plan.createdById !== userId) {
      throw new Error("Người dùng không phải là người tạo kế hoạch");
    }

    if(plan.isStart) {
      return this.response(200, "Plan already started");
    }

    const updatedPlan = await this.planModel.updatePlan(planId, {
      isStart: true,
    });

    if(updatedPlan.groupId) {
      const group = await this.groupModel.findGroupById(updatedPlan.groupId);

    const groupMembers = await this.groupMemberModel.getGroupMemberByGroupId(
      group.groupId
    );
    // groupMembers.remove(updatedPlan.createdById);
    // Notify all members in the group
    groupMembers.forEach((member) => {
      NotificationService.sendToUsers([member.userId], {
        title: "Kế hoạch đã được bắt đầu",
        body: `${updatedPlan.createdBy.firstName} ${updatedPlan.createdBy.lastName} đã bắt đầu kế hoạch ${updatedPlan.name}`,
        data: {
          planId: updatedPlan.planId,
        },
      });
    });
    const socketIds = groupMembers.map((member) => member.userId);

    io.to(socketIds).emit("plan_start", {socketIds, plan: updatedPlan});
    }

    // Socket

    return this.response(200, updatedPlan);
  }

  async deletePlanCostSharing() {
    const userId = await this.authUserId();
    const { costShareId } = this.req.params;
    await this._checkPlanAccess(costShareId, userId);
    await this.planCostSharingModel.deletePlanCostSharing(costShareId);
    return this.response(200, "Delete plan cost sharing successfully"); 
  }

  async getAllCostSharingByPlanId(planId) {
    const plan = await this.planModel.findPlanById(planId);
    if (!plan) {
      throw Error("Plan not found");
    }
    const costSharing = await this.planCostSharingModel.findCostSharingByPlanId(planId);
    return this.response(200, costSharing);
  }

  async getAllNotPaid(planId) {}

  async getAllCostSharingByPlanLocationId() {}

  async addSharedUserToCostSharing() {}

  async removeUserSharedInCostSharing() {}

  // Shared user
  async updateSharedUserIsPaid() {}

  async updatePaidAllPlan() {}

  // Check Plan Access //
  async _checkPlanAccess(planId, userId) {
    const plan = await this.planModel.findPlanById(planId);
    if (!plan) {
      throw Error("Plan not found");
    }

    if (plan.groupId) {
      const group = await this.groupModel.findGroupById(plan.groupId);
      const groupMember = await this.groupMemberModel.existUserFromGroup(
        userId,
        group.groupId
      );
      if (plan.createdById !== userId && !groupMember) {
        throw Error("You can't access this plan");
      }
    }

    return plan;
  }

  async _checkUserIsPlanCreator(planId, userId) {
    const plan = await this.planModel.findPlanById(planId);
    if (!plan) {
      throw Error("Plan not found");
    }
    if (plan.createdById !== userId) {
      throw Error("You can't access this plan");
    }
  }
}

module.exports = PlanController;
