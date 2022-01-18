const bcrypt = require("bcryptjs");
const ejs = require("ejs");
const path = require("path");
const nodemailer = require("nodemailer");
const http = require("https");

class AuthManager {
  constructor(wagner, sequelize) {
    this.User = wagner.get("User");
    this.sequelize = sequelize;
    this.Admin = wagner.get("Admin");
    this.Event = wagner.get("Event");
  }

  /**
   * Login
   * @param {*} params
   */
  async login(req) {
    try {
      let params = {
        email: req.body.email,
        password: req.body.password,
      };
      if (req.body.slug == "") {
        let emailId = { email: params.email, isActive: 1 };
        var AdminData = await this.Admin.findOne({ where: emailId });

        if (AdminData != null) {
          // check password
          if (bcrypt.compareSync(params.password, AdminData.password)) {
            return {
              status_code: 200,
              status: "success",
              data: AdminData,
            };
          } else {
            return {
              status_code: 201,
              status: "Fail",
              message: "Incorrect password",
            };
          }
        } else {
          return {
            status_code: 201,
            status: "Fail",
            message: "User Not found",
          };
        }
      } else {
        var getEventId = await this.Event.findOne({
          where: {
            event_slug: req.body.slug,
          },
        });
        if (getEventId != null) {
          var otherRoleData = await this.User.findOne({
            where: {
              email: params.email,
              event_id: getEventId.id,
              role_id: {
                $in: ["2", "3", "4", "5"],
              },
            },
          });
          if (otherRoleData != null) {
            // check  with password
            if (bcrypt.compareSync(params.password, otherRoleData.password)) {
              otherRoleData.dataValues["slug"] = getEventId.event_slug;
              otherRoleData.dataValues["event_name"] = getEventId.event_name;
              otherRoleData.dataValues["event_date"] = getEventId.event_date;
              otherRoleData.dataValues["event_time"] = getEventId.event_time;

              return {
                status_code: 200,
                status: "success",
                data: otherRoleData,
              };
            } else {
              return {
                status_code: 201,
                status: "Fail",
                message: "Incorrect password",
              };
            }
          } else {
            return {
              status_code: 202,
              status: "success",
              message: "User not found",
            };
          }
        } else {
          return {
            status_code: 202,
            status: "failed",
            message: "Event not found",
          };
        }
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
   * onSpot Registration
   * @param {*} params
   */
  async registartion(params) {
    try {
      var email = params.body.email;
      var newData = await this.User.findOne({ where: { email: email } });
      var first_name = params.body.first_name;
      var last_name = params.body.last_name;
      if (newData == null) {
        let userLoginData = {
          email: email,
          first_name: first_name,
          last_name: last_name,
          role_id: 2,
          on_spot_reister: 1,
        };
        await this.User.findOrCreate({
          where: { email: email },
          defaults: userLoginData,
        });
        var Data = await this.User.findOne({ where: { email: email } });
        await this.User.update({ islogin: 1 }, { where: { id: Data.id } });
        return {
          status_code: 200,
          status: "Success",
          message: "User Register Successfully",
          data: Data,
        };
      } else {
        return {
          status_code: 202,
          status: "Success",
          message: "User Exists",
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
   * Mail on registration
   * @param {*} userdata
   * @param {*} data
   * @returns
   */

  async registration_mail(userdata, data) {
    var mail_details = JSON.parse(data.dataValues.smtp);
    const transport = nodemailer.createTransport({
      host: mail_details.smtp_mail_host,
      port: mail_details.smtp_mail_port,
      auth: {
        user: mail_details.smtp_mail_username,
        pass: mail_details.smtp_mail_password,
      },
    });

    var template = "registration.ejs";
    var sub = "User Registered Successfully";

    var moredata = {
      fname: userdata.first_name ? userdata.first_name : "New",
      lname: userdata.last_name ? userdata.last_name : " ",
      email: userdata.email,
      user_msg:
        "Congrats , you have successfully registered for the event. Please wait for the approval.",
    };

    let emailTemplate = await ejs.renderFile(
      path.resolve(__dirname + "/../views/" + template),
      moredata
    );
    let sendMailfun = await transport.sendMail({
      from: mail_details.smtp_from_email,
      to: userdata.email,
      subject: sub,
      html: emailTemplate,
    });
    if (!sendMailfun) {
      return {
        success: false,
        status: 400,
        message: "error",
      };
    } else {
      return {
        success: true,
        status: 200,
        message: "Mail sent",
      };
    }
  }

  /**
   * Send Mobile OTP
   * @param {*} params
   * @param {*} slug
   * @returns
   */

  async sendOtp(userdata, data, userotp) {
    const new_msg = data.message_body + " " + userotp;
    const new_uri =
      "/api/SMS?message=" +
      new_msg +
      "&to=" +
      userdata.mobile_number +
      "&senderid=ANYSENDERID&type=Trans&contentid=NA";
    const options = {
      method: "POST",
      hostname: "",
      port: null,
      path: encodeURI(new_uri),
      headers: {
        Authorization: "Bearer |",
      },
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });

    req.write(JSON.stringify({}));
    req.end();
  }
}

module.exports = AuthManager;
