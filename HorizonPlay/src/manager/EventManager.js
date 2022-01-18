const fs = require("fs");
const moment = require("moment");
const AWS = require("aws-sdk");

class EventManager {
  constructor(wagner, sequelize) {
    this.User = wagner.get("User");
    this.sequelize = sequelize;
    this.Event = wagner.get("Event");
    this.EventSetting = wagner.get("EventSetting");
  }

  /**
   * Upload file to S3 Bucket
   * @param {*} params
   */
  uploadtoS3(params) {
    const files = params;
    let file_size = files.size;
    let fileOriginalname = files.originalname;
    let old_path = files.path;
    let file_ext = files.originalname.split(".").pop();
    AWS.config.update({
      accessKeyId: "",
      secretAccessKey: "",
    });
    let s3 = new AWS.S3();
    let myBucket = "";
    let file_n = moment().valueOf();
    let file_name = file_n.toString() + "." + file_ext;
    let myKey = file_name;
    let myKeyname = file_name;
    let mimetype = files.mimetype.split("/");
    let file_type = mimetype[0];
    let content_type = files.mimetype;

    return new Promise((resolve, reject) => {
      const sendTos3 = fs.readFile(old_path, (err, data) => {
        if (err) {
          return {
            status_code: 500,
            status: "Failure",
            error: "Internal Server Error!",
            error: err,
          };
        } else {
          let params = {
            Bucket: myBucket,
            Key: myKey,
            Body: data,
            ACL: "public-read",
            ContentType: content_type,
          };
          let url = "https://" + myBucket + ".s3.amazonaws.com/" + file_name;
          s3.putObject(params, (err, result) => {
            if (err) {
              reject(err);
              return;
            } else {
              resolve({
                success: true,
                status: 600,
                message: "Media file saved",
                url: url,
              });
            }
          });
        }
      });
    });
  }

  /**
   * Get User count
   * @param {*} params
   */
  async getuserlogincount(slug) {
    try {
      var Data = await this.Event.findOne({
        where: { event_slug: slug },
      });

      if (Data != null) {
        let eventID = Data.id;

        const date = new Date();
        const month = date.getMonth() + 1;
        const newData = date.getDate() + 1;
        var todayData = date.getFullYear() + "-" + month + "-" + date.getDate();
        var nextDate = date.getFullYear() + "-" + month + "-" + newData;

        var result = await this.User.findAll({
          attributes: [
            [
              this.sequelize.fn("count", this.sequelize.col("role_id")),
              "count",
            ],
          ],
          where: {
            role_id: "6",
            updatedAt: { $between: [todayData, nextDate] },
            islogin: 1,
            event_id: eventID,
          },
          raw: true,
        });
        if (result != null) {
          return {
            status_code: 200,
            status: "Success",
            message: "Event Fired",
            data: result,
          };
        } else {
          return {
            status_code: 200,
            status: "Success",
            message: "No User has login yet",
            data: [],
          };
        }
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

  /**
   * Get Logged in Users details
   * @param {*} params
   */
  async getloggedinusersdetails(slug) {
    try {
      var Data = await this.Event.findOne({
        where: { event_slug: slug },
      });

      if (Data != null) {
        let eventID = Data.id;

        var result = await this.User.findAll({
          where: { role_id: "6", islogin: 1, event_id: eventID },
          order: [["createdAt", "desc"]],
        });
        if (result.length > 0) {
          return {
            status_code: 200,
            status: "Success",
            message: "Event Fired",
            data: result,
          };
        } else {
          return {
            status_code: 200,
            status: "Success",
            message: "No User has login yet",
            data: [],
          };
        }
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

  /**
   * Get Event Settings
   * @param {*} params
   */
  async getEventSettings(slug) {
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

module.exports = EventManager;
