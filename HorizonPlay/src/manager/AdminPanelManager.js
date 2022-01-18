const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

class AdminPanelManager {
  constructor(wagner, sequelize) {
    this.User = wagner.get("User");
    this.sequelize = sequelize;
    this.Event = wagner.get("Event");
    this.EventSetting = wagner.get("EventSetting");
  }

  /*
   * addEvent
   * @param {*} params
   */
  async addEvent(params) {
    try {
      var checkSlug = await this.Event.findOne({
        where: {
          event_slug: params.event_slug,
        },
      });
      if (checkSlug == null) {
        var insertdata = {
          event_name: params.event_name,
          client_name: params.client_name,
          event_date: params.event_date,
          event_time: params.event_time,
          event_manager_email_id: params.event_manager_email_id,
          event_manager_email_password: params.event_manager_email_password,
          tech_support_email_id: params.tech_support_email_id,
          tech_support_email_password: params.tech_support_email_password,
          registration_manager_email_id: params.registration_manager_email_id,
          registration_manager_email_password:
            params.registration_manager_email_password,
          qna_panel_email_id: params.qna_panel_email_id,
          qna_panel_email_password: params.qna_panel_email_password,
          event_slug: params.event_slug,
          base_url: params.base_url,
          event_registration_type: params.event_registration_type,
          closed_registration_type: params.closed_registration_type,
          smtp: JSON.stringify(params.smtp),
          mobile_details_number: params.mobile_details_number,
          dynamic_fields: JSON.stringify(params.dynamic_fields),
          email_body: params.email_body,
          email_header: params.email_header,
          email_footer: params.email_footer,
          email_subject: params.email_subject,
          email_link: params.email_link,
          message_body: params.message_body,
        };
        const EventId = await this.Event.create(insertdata);
        if (EventId.id) {
          // create event settings
          await this.EventSetting.create({ event_id: EventId.id });
          //
          var allRoleArray = [
            {
              event_id: EventId.id,
              role_id: 1,
              first_name: "Event",
              last_name: "Manager",
              email: params.event_manager_email_id,
              password: bcrypt.hashSync(
                params.event_manager_email_password,
                salt
              ),
            },
            {
              event_id: EventId.id,
              role_id: 2,
              first_name: "Registration",
              last_name: "Manager",
              email: params.registration_manager_email_id,
              password: bcrypt.hashSync(
                params.registration_manager_email_password,
                salt
              ),
            },
            {
              event_id: EventId.id,
              role_id: 3,
              first_name: "Tech",
              last_name: "Support",
              email: params.tech_support_email_id,
              password: bcrypt.hashSync(
                params.tech_support_email_password,
                salt
              ),
            },
            {
              event_id: EventId.id,
              role_id: 4,
              first_name: "QNA",
              last_name: "Manager",
              email: params.qna_panel_email_id,
              password: bcrypt.hashSync(params.qna_panel_email_password, salt),
            },
          ];

          await this.User.bulkCreate(allRoleArray);
          return {
            status_code: 200,
            status: "sucess",
            message: "Event Created Successfully",
          };
        } else {
          return {
            status_code: 202,
            status: "failed",
            message: "Event crreation failed",
          };
        }
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "Slug Allrady Exists",
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

  /*
   * getEvent
   * @param {*} params
   */
  async getEvent(params) {
    try {
      var Data = await this.Event.findAll({ order: [["createdAt", "desc"]] });
      if (Data.length > 0) {
        var filterData = Data.map(function (val) {
          val.smtp = JSON.parse(val.smtp);
          val.dynamic_fields = JSON.parse(val.dynamic_fields);
          return val;
        });
        return {
          status_code: 200,
          status: "sucess",
          message: "Data found",
          data: filterData,
        };
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "No data Found",
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

  /*
   * getEventById
   * @param {*} params
   */
  async getEventbyId(id) {
    try {
      var Data = await this.Event.findOne({
        where: { id: id },
      });
      if (Data != null) {
        Data.smtp = JSON.parse(Data.smtp);
        Data.dynamic_fields = JSON.parse(Data.dynamic_fields);
        return {
          status_code: 200,
          status: "sucess",
          message: "Data found",
          data: Data,
        };
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "No data Found",
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

  /*
   * updateEvent
   * @param {*} params
   */
  async updateEvent(params) {
    try {
      var Data = await this.Event.findOne({
        where: { id: params.id },
      });
      if (Data != null) {
        var updatedata = {
          event_name: params.event_name,
          client_name: params.client_name,
          event_date: params.event_date,
          event_time: params.event_time,
          event_manager_email_id: params.event_manager_email_id,
          event_manager_email_password: params.event_manager_email_password,
          tech_support_email_id: params.tech_support_email_id,
          tech_support_email_password: params.tech_support_email_password,
          registration_manager_email_id: params.registration_manager_email_id,
          registration_manager_email_password:
            params.registration_manager_email_password,
          qna_panel_email_id: params.qna_panel_email_id,
          qna_panel_email_password: params.qna_panel_email_password,
          event_slug: params.event_slug,
          base_url: params.base_url,
          event_registration_type: params.event_registration_type,
          closed_registration_type: params.closed_registration_type,
          smtp: JSON.stringify(params.smtp),
          mobile_details_number: params.mobile_details_number,
          dynamic_fields: JSON.stringify(params.dynamic_fields),
          email_body: params.email_body,
          email_header: params.email_header,
          email_footer: params.email_footer,
          email_subject: params.email_subject,
          email_link: params.email_link,
          message_body: params.message_body,
        };

        await this.Event.update(updatedata, { where: { id: params.id } });
        var Data = await this.Event.findOne({
          where: { id: params.id },
        });

        await this.User.update(
          {
            email: params.event_manager_email_id,
            password: bcrypt.hashSync(
              params.event_manager_email_password,
              salt
            ),
          },
          { where: { role_id: 1, event_id: params.id } }
        );

        await this.User.update(
          {
            email: params.registration_manager_email_id,
            password: bcrypt.hashSync(
              params.registration_manager_email_password,
              salt
            ),
          },
          { where: { role_id: 2, event_id: params.id } }
        );

        await this.User.update(
          {
            email: params.tech_support_email_id,
            password: bcrypt.hashSync(params.tech_support_email_password, salt),
          },
          { where: { role_id: 3, event_id: params.id } }
        );

        await this.User.update(
          {
            email: params.qna_panel_email_id,
            password: bcrypt.hashSync(params.qna_panel_email_password, salt),
          },
          { where: { role_id: 4, event_id: params.id } }
        );

        Data.smtp = JSON.parse(Data.smtp);
        Data.dynamic_fields = JSON.parse(Data.dynamic_fields);

        return {
          status_code: 200,
          status: "sucess",
          message: "Data Updated Succesfully",
          data: Data,
        };
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "No event Found",
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
  /*
   * deleteEvent
   * @param {*} params
   */
  async deleteEvent(params) {
    try {
      var Data = await this.Event.findOne({
        where: {
          id: params.id,
        },
      });
      if (Data != null) {
        await this.Event.destroy({
          where: {
            id: params.id,
          },
        });
        return {
          status_code: 200,
          status: "sucess",
          message: "Event deleted Successfully",
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
        message: "Internal Server Error!",
        error: e,
      };
    }
  }

  /*
   * getEventBySlug
   * @param {*} params
   */
  async getEventBySlug(Slug) {
    try {
      var Data = await this.Event.findOne({
        where: { event_slug: Slug },
      });
      if (Data != null) {
        var data = {
          dynamic_fields: JSON.parse(Data.dynamic_fields),
          closed_registration_type: Data.closed_registration_type,
          event_registration_type: Data.event_registration_type,
          is_completed: Data.is_completed,
          off_image_url: Data.off_image_url,
        };
        return {
          status_code: 200,
          status: "sucess",
          message: "Data found",
          data: data,
        };
      } else {
        return {
          status_code: 201,
          status: "sucess",
          message: "No data Found",
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
}

module.exports = AdminPanelManager;
