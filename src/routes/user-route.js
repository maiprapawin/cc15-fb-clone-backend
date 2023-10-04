const express = require("express");

const userController = require("../controllers/user-controller");
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.patch(
  "/",
  authenticateMiddleware,
  // uploadMiddleware.array("qwerty"), //ชื่อ field ที่จะอัพโหลด
  uploadMiddleware.fields([
    // เช่น field นึงเป็นรูป products อีก field เป็น brand
    { name: "profileImage", maxCount: 1 }, //field profileImage อัพโหลดรูปได้มากสุด 1 รูป
    { name: "coverImage", maxCount: 1 }, //field coverImage อัพได้มากสุด 1 รูป
  ]),
  userController.updateProfile
);
router.get("/:userId", authenticateMiddleware, userController.getUserById);

module.exports = router;
