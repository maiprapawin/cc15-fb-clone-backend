const { STATUS_PENDING, STATUS_ACCEPTED } = require("../config/constant");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const {
  checkReceiverIdSchema,
  checkRequesterIdSchema,
} = require("../validators/user-validator");

///// 1. REQUEST FRIEND /////
exports.requestFriend = async (req, res, next) => {
  try {
    /// VALIDATE ///

    const { error, value } = checkReceiverIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }

    // 1.1 เช็คว่าเลขเท่ากันหรือเปล่า = ถ้าเท่าคือขอเป็นเพื่อนไม่ได้ เพราะคือตัวเอง
    if (value.receiverId === req.user.id) {
      return next(createError("cannot request yourself", 400));
    }

    // 1.2 หา user ที่เราพยายามขอเป็นเพื่อน ว่ามีอยู่ใน db มั้ย
    const targetUser = await prisma.user.findUnique({
      where: {
        id: value.receiverId,
      },
    });

    if (!targetUser) {
      return next(createError("user does not exist", 400));
    }

    // 1.3 เป็นเพื่อนกันอยู่แล้วหรือเปล่า (ในตารางเพื่อนใน db มีการร้องขอเป็นเพื่อนกันอยู่หรือเปล่า)
    // หาใน table friend ว่ามีความสัมพันธ์กันอยู่แล้วหรือเปล่าระหว่าง 2 id
    // firstFirst เพราะเรารู้ว่าถ้ามี มันมีแถวเดียวอยู่แล้ว
    // SELECT * FROM friend WHERE requesterId = 1 AND receiverId = 2
    // OR requesterId = 2 AND recevierId = 1
    const existRelationship = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId: value.receiverId },
          { requesterId: value.receiverId, receiverId: req.user.id },
        ],
      },
    });

    if (existRelationship) {
      return next(createError("user already has relationship", 400));
    }

    /////// VALIDATE END = ADD into friend table
    await prisma.friend.create({
      data: {
        requesterId: req.user.id,
        receiverId: value.receiverId,
        status: STATUS_PENDING,
      },
    });

    res.status(201).json({ message: "request has been sent" });
  } catch (err) {
    next(err);
  }
};

///// 2. ACCEPT FRIEND /////
exports.acceptRequest = async (req, res, next) => {
  try {
    const { value, error } = checkRequesterIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    /// 2.1 เช็คว่ามี relationship การขอ friend request มาแล้วมั้ย
    const existRelationship = await prisma.friend.findFirst({
      where: {
        requesterId: value.requesterId,
        receiverId: req.user.id,
        status: STATUS_PENDING,
      },
    });
    if (!existRelationship) {
      return next(createError("relationship does not exist", 400));
    }
    /// 2.2 ถ้ามีการขอเข้ามาแล้ว อัพเดทสเตตัสรับเพื่อน
    await prisma.friend.update({
      data: {
        status: STATUS_ACCEPTED,
      },
      where: {
        id: existRelationship.id,
      },
    });
    res.status(200).json({ message: "accepted" });
  } catch (err) {
    next(err);
  }
};
