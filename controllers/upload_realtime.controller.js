const BaseController = require("./base.controller");
const CloudinaryService = require("../services/cloudinary.service");
const RealTimePostModel = require("../models/realtime_post.model");
const FriendShipModel = require("../models/friend_ship.model");
const PostFeedModel = require("../models/post_feed.model");
const { CloudinaryFolder } = require("../enum/cloudinary.enum");

const cloudinaryService = new CloudinaryService();
const realTimePostModel = new RealTimePostModel();
const friendModel = new FriendShipModel();
const postFeedModel = new PostFeedModel();
class UploadRealTimeController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next);
  }

  async userUploadRealtime() {
    const { caption } = this.req.body;
    const file = this.req.file;
    const uid = await this.authUserId();

    const storageUpload = await cloudinaryService.uploadFile(
      file,
      CloudinaryFolder.post,
      "image"
    );

    const create = {
      publicId: storageUpload.public_id,
      imageUrl: storageUpload.url,
      format: storageUpload.format,
      width: storageUpload.width,
      height: storageUpload.height,
      type: "realtime",
    };
    const data = {
      userId: uid,
      caption,
      images: {
        create: [create],
      },
    };
    const uploadRealTime = await realTimePostModel.createRealtimePost(data);

    const friends = await friendModel.findFriendshipByUserId(uid);

    const feedData = friends.map(friend => ({
      userId: friend.user.userId, 
      postId: uploadRealTime.realtimePostId, 
      createdAt: new Date(),   
    }));

    feedData.push({
      userId: uid, 
      postId: uploadRealTime.realtimePostId,
      createdAt: new Date(),
    });

    await postFeedModel.createManyPostFeed(feedData);


    return this.response(200, uploadRealTime);
  }

  async userGetAllRealtime() {
    const uid = await this.authUserId();
    const realtimePosts = await postFeedModel.getPostFeedByUserId(uid);
    return this.response(200, realtimePosts);
  }


  async userGetAllFriendPost() {
    const uid = await this.authUserId();
    const realtimePosts = await realTimePostModel.findAllFriendPost(uid);
    return this.response(200, realtimePosts);
  }

  async groupUploadRealtime() {
    const { caption, groupId } = this.req.body;
    const file = this.req.file;
    const uid = await this.authUserId();

    const storageUpload = await cloudinaryService.uploadFile(
      file,
      CloudinaryFolder.post,
      "image"
    );

    const create = {
      publicId: storageUpload.id,
      imageUrl: storageUpload.url,
      format: storageUpload.format,
      width: storageUpload.width,
      height: storageUpload.height,
      type: "realtime",
      isOnlyUser: false,
    };

    const data = {
      userId: uid,
      caption,
      groupId,
      images: [create],
    };

    const uploadRealTime = await realTimePostModel.groupUploadRealtime(data);
    return this.response(200, uploadRealTime);
  }

  async groupGetAllRealtime() {
    const { groupId } = this.req.params;
    const realtimePosts = await realTimePostModel.findAllByGroupId(groupId);
    return this.response(200, realtimePosts);
  }

  async deleteUploadRealtime(realtimePostId) {
    const uid = await this.authUserId();
    const deleteUploadRealtime = await realTimePostModel.deleteById(
      realtimePostId,
      uid
    );
    return this.response(200, deleteUploadRealtime);
  }
}

module.exports = UploadRealTimeController;
