const BaseController = require("./base.controller");
const FriendShipModel = require("../models/friend_ship.model");

class FriendShipController extends BaseController {
  constructor(req, res) {
    super(req, res);
    this.friendShipModel = new FriendShipModel();
  }

  async addFriend() {
    const userId = this.authUserId();
    const { friendId } = this.req.body;

    if(!friendId) {
      throw Error("Friend ID is required");
    }

    if (userId === friendId) {
      throw Error("You cannot add yourself as a friend");
    }

    const user = await this.userModel.findUserById(friendId);
    if(!user) {
      throw Error("User not found");
    }

    const isFriend = await this.friendShipModel.exitsFriendship(userId, friendId);
    if(isFriend) {
      throw Error("You are already friends");
    }

    const friendship = await this.friendShipModel.createFriendship({
      user1Id: userId,
      user2Id: friendId,
    });
    return this.response(200, friendship);
  }

  async acceptFriend() {
    const userId = this.authUserId();
    const { friendshipId } = this.req.body;
    
    if(!friendshipId) {
      throw Error("Friendship ID is required");
    }

    const user = await this.userModel.findUserById(friendshipId);
    if(!user) {
      throw Error("User not found");
    }

    const isFriend = await this.friendShipModel.exitsFriendship(userId, friendId);
    if(!isFriend) {
      throw Error("You are not friends");
    }
    if(isFriend.status === "accepted") {
      throw Error("You are already friends");
    }

    const friendship = await this.friendShipModel.updateFriendship(friendshipId, {
      status: "accepted",
    });
    return this.response(200, friendship);
  }

  async getFriendList() {
    const userId = this.authUserId();
    const friendships = await this.friendShipModel.findFriendshipByUserId(userId);
    return this.response(200, friendships);
  }
}

module.exports = FriendShipController;