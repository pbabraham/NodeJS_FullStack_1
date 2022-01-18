const express = require("express");
const router = express.Router();
const role = require("../../middleware/Role");
const authenticateToken = require("../../middleware/Authenticatetoken");

module.exports = (app, wagner) => {
  router.get(
    "/getUserloginCount",
    role.eventManager,
    authenticateToken,
    async (req, res) => {
      wagner
        .get("EventManager")
        .getuserlogincount(req.query.slug)
        .then((results) => {
          if (
            res.status_code == 201 ||
            res.status_code == 202 ||
            res.status_code == 500
          ) {
            res.status(200).send({ message: res.message, auth: true });
          } else {
            return res.status(200).send(results);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  );

  router.get(
    "/getLoggedInUsersDetails",
    role.eventManager,
    authenticateToken,
    async (req, res) => {
      wagner
        .get("EventManager")
        .getloggedinusersdetails(req.query.slug)
        .then((results) => {
          if (
            res.status_code == 201 ||
            res.status_code == 202 ||
            res.status_code == 500
          ) {
            res.status(200).send({ message: res.message, auth: true });
          } else {
            return res.status(200).send(results);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  );

  router.get(
    "/getEventSettings",
    role.eventManager,
    authenticateToken,
    async (req, res) => {
      wagner
        .get("EventManager")
        .getEventSettings(req.query.slug)
        .then((results) => {
          if (
            res.status_code == 201 ||
            res.status_code == 202 ||
            res.status_code == 500
          ) {
            res.status(200).send({ message: res.message, auth: true });
          } else {
            return res.status(200).send(results);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  );

  return router;
};
