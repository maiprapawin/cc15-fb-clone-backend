const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate"); //ทำให้เราเรียก req.user ได้
const friendController = require("../controllers/friend-controller");

const router = express.Router();

// 1. Request friend
router.post(
  "/:receiverId",
  authenticateMiddleware,
  friendController.requestFriend
);

// 2. Accept friend
router.patch(
  "/:requesterId",
  authenticateMiddleware,
  friendController.acceptRequest
);

// 3. Delete
// 3.1 Reject friend request
router.delete(
  "/:requesterId/reject",
  authenticateMiddleware,
  friendController.rejectRequest
);

// 3.2 Cancel friend request โดย auth user
router.delete(
  "/:receiverId/cancel",
  authenticateMiddleware,
  friendController.cancelRequest
);

// 3.3 Unfriend
router.delete(
  "/:friendId/unfriend",
  authenticateMiddleware,
  friendController.unfriend
);

module.exports = router;
