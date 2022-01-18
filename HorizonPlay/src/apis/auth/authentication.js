const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
var config = require("../../../config/development");
// var jwt 				= require('jwt-simple');
const jwt = require("jsonwebtoken");
const passport = require("passport");

module.exports = (app, wagner) => {
  router.post(
    "/login",
    [
      check("email")
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Email is not valid"),
      check("password")
        .notEmpty()
        .withMessage("password is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("Minimum 6 characters are required"),
    ],
    (req, res) => {
      wagner
        .get("AuthManager")
        .login(req)
        .then((users) => {
          if (
            users.status_code == 201 ||
            users.status_code == 202 ||
            users.status_code == 500
          ) {
            res
              .status(200)
              .send({ message: users.message, auth: false, status_code: 400 });
          } else {
            // create a tokenzzz
            var payload = { user: users };
            jwt.sign(
              payload,
              config.secret,
              { expiresIn: 36000 },
              (err, token) => {
                if (err)
                  res
                    .status(500)
                    .json({ error: "Error signing token", raw: err });
                res.status(200).send({
                  message: "Login Succesfully",
                  status: "success",
                  status_code: 200,
                  auth: true,
                  token: token,
                });
              }
            );
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  );

  router.post("/Registration", async (req, res) => {
    wagner
      .get("AdminManager")
      .onSpotRegistartion(req)
      .then((results) => {
        if (
          results.status_code == 201 ||
          results.status_code == 202 ||
          results.status_code == 500
        ) {
          res.status(200).send({ message: results.message, auth: false });
        } else {
          var payload = { user: results };
          jwt.sign(
            payload,
            config.secret,
            { expiresIn: 36000 },
            (err, token) => {
              results.token = token;
              res.status(200).send(results);
            }
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  router.get("/logout", function (req, res) {
    res.status(200).send({ auth: false, token: null });
  });

  getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(" ");
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  return router;
};
