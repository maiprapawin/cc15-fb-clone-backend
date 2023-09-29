const express = require("express");
const authController = require("../controllers/auth-controller");
const authenticateMiddleware = require("../middlewares/authenticate"); // แกะ request header และ verify token
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// router.use(authenticateMiddleware);
// router.get("/me", authController.getMe);
router.get("/me", authenticateMiddleware, authController.getMe); //ต้องผ่่าน middleware authenticate ก่อน ถึงจะมาที่ getMe ได้

module.exports = router;
