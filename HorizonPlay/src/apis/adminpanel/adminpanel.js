const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
var config = require("../../../config/development");
const jwt = require("jsonwebtoken");
const passport = require("passport");
var jwtDecode = require("jwt-decode");
const role = require("../../middleware/Role");
const authenticateToken = require("../../middleware/Authenticatetoken");

var multer = require("multer");
const storage = multer.diskStorage({
  limits: { fileSize: 5000 },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage });

module.exports = (app, wagner) => {
  router.post(
    "/createEvent",
    [authenticateToken, role.admin],
    async (req, res) => {
      if (
        res.status_code == 201 ||
        res.status_code == 202 ||
        res.status_code == 500
      ) {
        res.status(200).send({ message: res.message, auth: true });
      } else {
        wagner
          .get("AdminPanelManager")
          .addEvent(req.body)
          .then((results) => {
            return res.status(200).send(results);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  );

  router.get(
    "/getEvent/",
    authenticateToken,
    role.admin,
    async (req, res, next) => {
      wagner
        .get("AdminPanelManager")
        .getEvent()
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
    "/getEventbyId/:id",
    authenticateToken,
    role.admin,
    async (req, res) => {
      wagner
        .get("AdminPanelManager")
        .getEventbyId(req.params.id)
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

  router.put(
    "/updateEvent/",
    authenticateToken,
    role.admin,
    async (req, res) => {
      wagner
        .get("AdminPanelManager")
        .updateEvent(req.body)
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

  router.delete(
    "/deleteEvent/:id",
    authenticateToken,
    role.admin,
    async (req, res) => {
      wagner
        .get("AdminPanelManager")
        .deleteEvent(req.params)
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

  router.get("/getEventBySlug/:slug", async (req, res) => {
    wagner
      .get("AdminPanelManager")
      .getEventBySlug(req.params.slug)
      .then((results) => {
        if (
          res.status_code == 201 ||
          res.status_code == 202 ||
          res.status_code == 500
        ) {
          res.status(200).send({ message: res.message, status_code: 400 });
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
