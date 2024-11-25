const BaseController = require("./base.controller");
const CloudinaryImageModel = require("../models/cloudinary_image.model");
const Group = require("../models/group.model");
const GroupMemberModel = require("../models/group_menber.model");
const CloudinaryService = require("../services/cloudinary.service");
class GroupController extends BaseController{
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
  async createGroup(){
    const uid = await this.authUserId();
    const { name, members } = this.req.body;

    const data = {
      name,
      createdById: uid,
    }

    const group = await this.groupModel.createGroup(data);

    let memberData = [];
    if(members){
      memberData = members.map((member) => {
        return {
          groupId: group.groupId,
          userId: member,
        }
      });
    }

    await this.groupMemberModel.createGroupMembers(memberData);

    return this.response(200, group);
  }

  async editGroup(uid){
    const { groupId } = this.req.body;

    await this._checkIsMenberInGroup(uid, groupId);

    const data = {
      name: this.req.body.name,
    }

    await this.groupModel.updateGroup(groupId, data);
  }

  async setGroupAvatar(groupId){
    const uid = await this.authUserId();
    const file = this.req.file;

    await this._checkIsMenberInGroup(uid, groupId);

    const group = await this.groupModel.findGroupById(groupId);
    if(!group){
      throw Error("Group not found");
    }

    const cloudinaryImage = await this.cloudinaryService.uploadImage(file);

    const cloudinaryImageData = await this.cloudinaryImageModel.createCloudinaryImage({
      publicId: cloudinaryImage.public_id,
      imageUrl: cloudinaryImage.secure_url,
      type: "avatar",
      format: cloudinaryImage.format,
      width: cloudinaryImage.width,
      height: cloudinaryImage.height,
    });


    const groupRes = await this.groupModel.setGroupAvatar(groupId, cloudinaryImageData.cloudinaryImageId);

    return this.response(200, groupRes);
  }

  async leaveGroup(groupId){
    const uid = await this.authUserId();

    await this._checkIsMenberInGroup(uid, groupId);

    const result = await this.groupMemberModel.exitUserFromGroup(uid, groupId);

    if(!result){
      throw Error("User not found in group");
    }

    await this.groupMemberModel.deleteGroupMember(uid, groupId);

    return this.response(200, "User left group successfully");
  }

  async findAll(){
    const uid = await this.authUserId();

    const groups = await this.groupModel.getAllGroupMembersByUserId(uid);

    const result = groups.map((group) => {
      return this.groupModel.findGroupById(group.groupId);
    });

    return this.response(200, result);
  }

  async _checkIsMenberInGroup(uid, groupId){
    const result = await this.groupMemberModel.checkIsMenberInGroup(uid, groupId);
    const group = await this.groupModel.isCreator(groupId, uid);

    if(!result && !group){
      throw Error("You are not a member of this group");
    }
  }
}

module.exports = GroupController;
