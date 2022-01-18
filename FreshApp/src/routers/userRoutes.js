const router=require("express").Router()
const userControl=require("../controllers/userController")
const authControl=require("../controllers/authController")
const {verification}=require("../util/middleware")

const { body, validationResult } = require('express-validator');


// router for registration and validating email and password 
router.post("/register",
    body('email').isEmail().trim(),
    body('password').isLength({min: 6}),
    authControl.register)

router.post("/login",
    body("email").isEmail().notEmpty().trim(),
    authControl.login)

router.delete("/delete",verification,userControl.deleteAccount)

router.post("/upgradePlan",
    body("planId").notEmpty().withMessage('planId required'),
    verification,userControl.takeAPlane)


router.post("/forget_password",
    body('email').isEmail().trim(),
    authControl.forgetPasswordLink
)

router.post("/reset_password/:token",
    body('password').isLength({min: 6}),
    authControl.resetPassword
)


module.exports=router