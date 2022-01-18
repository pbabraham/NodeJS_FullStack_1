class UserPanelManager {
  constructor(wagner, sequelize) {
    this.User = wagner.get("User");
    this.sequelize = sequelize;
    this.Event = wagner.get("Event");
    this.EventSetting = wagner.get("EventSetting");
  }

  /**
   * Get  All Users list for chat
   * @param {*} params
   */
  async getallregisteredusers(slug) {
    try {
      var Data = await this.Event.findOne({
        where: { event_slug: slug },
      });
      if (Data != null) {
        var result = await this.User.findAll({
          where: { role_id: "6", event_id: Data.dataValues.id },
          order: [["createdAt", "desc"]],
        });
        if (result != null) {
          return {
            status_code: 200,
            status: "Success",
            message: "Data get successfully",
            data: result,
          };
        } else {
          return {
            status_code: 201,
            status: "Success",
            message: "No User Found",
            data: [],
          };
        }
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "No Event Found",
          data: [],
        };
      }
    } catch (e) {
      return {
        status_code: 500,
        status: "Failure",
        message: "Internal Server Error!",
        error: e,
      };
    }
  }

  /**
   * Get Event Settings For User
   * @param {*} params
   */
  async getUserEventSettings(slug) {
    try {
      var Data = await this.Event.findOne({
        where: { event_slug: slug },
      });

      if (Data != null) {
        let eventID = Data.id;
        var result = await this.EventSetting.findOne({
          where: { event_id: eventID },
        });
        return {
          status_code: 200,
          status: "success",
          data: result,
        };
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "No Event Found",
        };
      }
    } catch (e) {
      return {
        status_code: 500,
        status: "Failure",
        error: "Internal Server Error!",
        error: e,
      };
    }
  }
}

module.exports = UserPanelManager;
