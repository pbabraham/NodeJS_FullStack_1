const express = require("express");
const router = express.Router();
const role = require("../../middleware/Role");
const authenticateToken = require("../../middleware/Authenticatetoken");

module.exports = (app, wagner) => {
  router.get(
    "/getAllRegisteredUsers/",
    authenticateToken,
    role.user,
    async (req, res) => {
      wagner
        .get("UserPanelManager")
        .getallregisteredusers(req.query.slug)
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

  router.get("/getUserEventSettings", async (req, res) => {
    wagner
      .get("UserPanelManager")
      .getUserEventSettings(req.query.slug)
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
  });

  return router;
};
