const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const postController = require("../controllers/post-controller");
const likeController = require("../controllers/like-controller");

const router = express.Router();

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  postController.createPost
);

router.get(
  "/friend",
  authenticateMiddleware,
  postController.getAllPostIncludeFriendPost
);

//การจัดการ like ของ post post นึง
router.post("/:postId/like", authenticateMiddleware, likeController.toggleLike);

router.delete("/:postId", authenticateMiddleware, postController.deletePost);

module.exports = router;
