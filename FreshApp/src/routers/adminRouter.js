const router=require("express").Router()
const adminControl=require("../controllers/adminController")
const {verification,isAdmin}=require("../util/middleware")
const { body, validationResult } = require('express-validator');

router.get("/all_users",verification,isAdmin,adminControl.showAllUsers)
router.get("/single_user/:id",verification,isAdmin,adminControl.particularUser)
router.put("/update_user/:id",verification,isAdmin,adminControl.updateUser)

router.post("/create_user",
    body('email').isEmail().trim().normalizeEmail(),
    body('password').isLength({min: 6}),
    verification,isAdmin,adminControl.createUser)

// check all !accessible performers

router.delete("/delete_user/:userId",verification,isAdmin,adminControl.deleteUser)
router.patch("/give_admin_permission/:userId",verification,isAdmin,adminControl.giveAdminPermission)
router.patch("/take_back_admin_permission/:userId",verification,isAdmin,adminControl.takeBackAdminPermission)
router.get("/total_movies",verification,isAdmin,adminControl.countAllMovies)
router.get("/total_series",verification,isAdmin,adminControl.countAllSeries)
router.get("/total_users",verification,isAdmin,adminControl.countAllUsers)

// create performer account
router.put("/create_performer_account/:performerId",verification,isAdmin,adminControl.createAccountForPerformer)

module.exports=router  