const BaseController = require("./base.controller");
const CloudinaryImageModel = require("../models/cloudinary_image.model");
const Group = require("../models/group.model");
const GroupMemberModel = require("../models/group_menber.model");
const CloudinaryService = require("../services/cloudinary.service");
class GroupController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next);
    this.groupModel = new Group();
    this.groupMemberModel = new GroupMemberModel();
    this.cloudinaryImageModel = new CloudinaryImageModel();
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * Example request body:
   * {
   *  "name": "Group Name",
   *  "members": ["userId1", "userId2", "userId3"]
   * }
   * @description Create a new group
   * @returns {Object} Group
   */
  async createGroup() {
    const uid = await this.authUserId();
    const { name, members } = this.req.body;

    let memberData = [];
    if (members) {
      memberData = members.map((member) => {
        if (member === uid) {
          return {
            userId: member,
            role: "ADMIN",
          };
        }
        return {
          userId: member,
        };
      });
    }

    const data = {
      name,
      createdById: uid,
      members: memberData,
      type: members.length > 2 ? "GROUP" : "DEFAULT",
    };

    const group = await this.groupModel.createGroup(data);

    return this.response(200, group);
  }

  async editGroup(groupId) {
    const { name } = this.req.body;
    const file = this.req.file;
    const uid = await this.authUserId();
    let cloudinaryImage;
    await this._checkIsMenberInGroup(uid, groupId);

    const group = await this.groupModel.findGroupById(groupId);
    if (group.avatar) {
      await this.cloudinaryService.destroyFile(group.avatar.publicId);
      cloudinaryImage = await this.cloudinaryService.uploadFile(file);

    } else {
      cloudinaryImage = await this.cloudinaryService.uploadFile(file);
    }

    const cloudinaryImageData =
      await this.cloudinaryImageModel.createCloudinaryImage({
        publicId: cloudinaryImage.public_id,
        imageUrl: cloudinaryImage.secure_url,
        type: "avatar",
        format: cloudinaryImage.format,
        width: cloudinaryImage.width,
        height: cloudinaryImage.height,
      });
    const data = {
      name: name,
      avatarId: cloudinaryImageData.cloudinaryImageId,
    };

    const groupRes = await this.groupModel.updateGroup(groupId, data);

    return this.response(200, groupRes);
  }

  async setGroupAvatar(groupId) {
    const uid = await this.authUserId();
    const file = this.req.file;

    await this._checkIsMenberInGroup(uid, groupId);

    const group = await this.groupModel.findGroupById(groupId);
    if (!group) {
      throw Error("Group not found");
    }

    const cloudinaryImage = await this.cloudinaryService.uploadFile(file);

    const cloudinaryImageData =
      await this.cloudinaryImageModel.createCloudinaryImage({
        publicId: cloudinaryImage.public_id,
        imageUrl: cloudinaryImage.secure_url,
        type: "avatar",
        format: cloudinaryImage.format,
        width: cloudinaryImage.width,
        height: cloudinaryImage.height,
      });

    const groupRes = await this.groupModel.setGroupAvatar(
      groupId,
      cloudinaryImageData.cloudinaryImageId
    );

    return this.response(200, groupRes);
  }

  async leaveGroup(groupId) {
    const uid = await this.authUserId();

    await this._checkIsMenberInGroup(uid, groupId);

    const result = await this.groupMemberModel.existUserFromGroup(uid, groupId);

    if (!result) {
      throw Error("User not found in group");
    }

    await this.groupMemberModel.deleteGroupMember(uid, groupId);

    return this.response(200, "User left group successfully");
  }

  async findAll() {
    const uid = await this.authUserId();

    const groups = await this.groupModel.getAllGroupMembersByUserId(uid);

    const result = await Promise.all(
      groups.map(async (group) => {
        return await this.groupModel.findGroupById(group.groupId, uid);
      })
    );

    return this.response(200, result);
  }

  async _checkIsMenberInGroup(uid, groupId) {
    const result = await this.groupMemberModel.checkIsMenberInGroup(
      uid,
      groupId
    );
    const group = await this.groupModel.isCreator(groupId, uid);

    if (!result && !group) {
      throw Error("You are not a member of this group");
    }
  }
}

module.exports = GroupController;
