const BaseController = require("./base.controller");
const FriendShipModel = require("../models/friend_ship.model");
const GroupModel = require("../models/group.model");
const UserModel = require("../models/user.model");
const NotificationService = require("../services/notification.service");
class FriendShipController extends BaseController {
  constructor(req, res) {
    super(req, res);
    this.friendShipModel = new FriendShipModel();
    this.userModel = new UserModel();
    this.groupModel = new GroupModel();
  }

  async addFriend() {
    const userId = await this.authUserId();
    const { phoneNumber } = this.req.body;
    const user = await this.userModel.getUserById(userId);

    if (!phoneNumber) {
      return this.response(400, "Phone number is required");
    }

    const friend = await this.userModel.getUserByPhone(phoneNumber);
    if (!friend) {
      return this.response(400, "User not found with this phone number");
    }

    const friendId = friend.userId;

    if (userId === friendId) {
      return this.response(400, "You cannot add yourself as a friend");
    }

    const isFriend = await this.friendShipModel.exitsFriendship(
      userId,
      friendId
    );

    if (isFriend && isFriend.status === "accepted") {
      return this.response(400, "You are already friends");
    }

    if (isFriend && isFriend.status === "pending") {
      return this.response(400, "You are waiting for this user to accept your friend request");
    }

    await NotificationService.sendToUser(friendId, {
      title: "Friend request",
      body: "You have a friend request from " + user.firstName + " " + user.lastName,
    });

    const friendship = await this.friendShipModel.createFriendship({
      user1Id: userId,
      user2Id: friendId,
    });
    return this.response(200, friendship);
  }

  async findPendingFriendshipByUserId() {
    const userId = await this.authUserId();
    const friendships = await this.friendShipModel.findPendingFriendshipByUserId(userId);
    return this.response(200, friendships);
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
      isReplyFriend.friendshipId,
      {
        status: "accepted",
      }
    );

    /// Create group
    await this.groupModel.createGroup({
      members: [
        {
        userId: userId,
        },
        {
          userId: friendshipId,
        },
      ],
    });
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
