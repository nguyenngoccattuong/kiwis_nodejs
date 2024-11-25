const BaseController = require("./base.controller");

class GroupController extends BaseController{
  constructor(req, res, next) {
    super(req, res, next);
  }
  
  async createGroup(){}

  async editGroup(){}

  async leaveGroup(){}
}

module.exports = GroupController;
