const BaseController = require("./base.controller");
const FriendShipModel = require("../models/friend_ship.model");
const UserModel = require("../models/user.model");

class FriendShipController extends BaseController {
  constructor(req, res) {
    super(req, res);
    this.friendShipModel = new FriendShipModel();
    this.userModel = new UserModel();
  }

  async addFriend() {
    const userId = await this.authUserId();
    const { friendId } = this.req.body;

    if (!friendId) {
      throw Error("Friend ID is required");
    }

    if (userId === friendId) {
      throw Error("You cannot add yourself as a friend");
    }

    const user = await this.userModel.getUserById(friendId);
    if (!user) {
      throw Error("User not found");
    }

    const isFriend = await this.friendShipModel.exitsFriendship(
      userId,
      friendId
    );

    if (isFriend && isFriend.status === "accepted") {
      throw Error("You are already friends");
    }

    if (isFriend && isFriend.status === "pending") {
      throw Error(
        "You are waiting for this user to accept your friend request"
      );
    }

    const friendship = await this.friendShipModel.createFriendship({
      user1Id: userId,
      user2Id: friendId,
    });
    return this.response(200, friendship);
  }

  async acceptFriend() {
    const userId = await this.authUserId();
    const { friendshipId } = this.req.body;

    if (!friendshipId) {
      throw Error("Friendship ID is required");
    }

    const user = await this.userModel.getUserById(friendshipId);
    if (!user) {
      throw Error("User not found");
    }

    const isReplyFriend = await this.friendShipModel.exitsFriendship(
      friendshipId,
      userId
    );

    const isSenderFriend = await this.friendShipModel.exitsFriendship(
      userId,
      friendshipId
    );

    if (isSenderFriend) {
      throw Error(
        "You are waiting for this user to accept your friend request"
      );
    }

    if (!isReplyFriend) {
      throw Error("You are not friends");
    }

    if (isReplyFriend.status === "accepted") {
      throw Error("You are already friends");
    }

    const friendship = await this.friendShipModel.updateFriendship(
      friendshipId,
      userId,
      {
        status: "accepted",
      }
    );
    return this.response(200, friendship);
  }

  async getFriendList() {
    const userId = await this.authUserId();
    const friendships = await this.friendShipModel.findFriendshipByUserId(
      userId
    );
    return this.response(200, friendships);
  }

  async deleteFriendship() {
    const userId = await this.authUserId();
    const { friendshipId } = this.req.params;
    const friendship = await this.friendShipModel.deleteFriendship(friendshipId);
    return this.response(200, friendship);
  }
}

module.exports = FriendShipController;
