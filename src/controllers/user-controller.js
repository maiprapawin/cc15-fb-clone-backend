const fs = require("fs/promises");

const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const { checkUserIdSchema } = require("../validators/user-validator");
const {
  AUTH_USER,
  UNKNOWN,
  STATUS_ACCEPTED,
  FRIEND,
  REQUESTER,
  RECEIVER,
} = require("../config/constant");

const getTargetUserStatusWithAuthUser = async (targetUserId, authUserId) => {
  ////// STATUS มีได้ 5 อัน (ในไฟล์ constant.js) //////

  //// Status 1 ////
  if (targetUserId === authUserId) {
    return AUTH_USER;
  }

  const relationship = await prisma.friend.findFirst({
    // หาว่า userId กับ req.user.id (= คนที่ลอคอินอยู่) มีความสัมพันธ์กันหรือเปล่า
    where: {
      OR: [
        { requesterId: targetUserId, receiverId: authUserId },
        { requesterId: authUserId, receiverId: targetUserId },
      ],
    },
  });

  //// Status 2 ////
  // ถ้าเป็น null
  if (!relationship) {
    return UNKNOWN;
  }

  //// Status 3 ////
  if (relationship.status === STATUS_ACCEPTED) {
    return FRIEND;
  }

  //// Status 4 ////
  if (relationship.requesterId === authUserId) {
    return REQUESTER;
  }

  //// Status 5 ////
  return RECEIVER;
};

const getTargetUserFriends = async (targetUserId) => {
  // Logic ในการหาเพื่อน = STATUS: ACCEPTED AND (REQUESTER_ID = targetUserId OR RECEIVER_ID = targetUserId)
  const relationships = await prisma.friend.findMany({
    where: {
      status: STATUS_ACCEPTED,
      OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
    },
    select: {
      //ตามด้วยชื่อ key ที่เราจะ include
      requester: {
        select: {
          //เราไม่อยากให้ password มาด้วย เลยต้องมาลิสแต่ละอันที่จะเอาแทน
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          profileImage: true,
          coverImage: true,
        },
      },
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          profileImage: true,
          coverImage: true,
        },
      },
    },
  });
  console.log(relationships);

  // เช็คฝั่ง requester ว่าไอดีเท่ากับ targetUserId ใข่หรือไม่ ถ้าใช่ จะต้อง return ค่า el.receiver
  const friends = relationships.map((el) =>
    el.requester.id === targetUserId ? el.receiver : el.requester
  );
  // console.log(friends);
  return friends;
};

exports.updateProfile = async (req, res, next) => {
  try {
    // ถ้าจะเอารูปมาใช้ ต้องใช้จาก req.file แต่ต้องเป็น .single สำหรับรูปเดียวเท่านั้น
    // แต่ถ้าเป็น .array .fields จะต้องเป็น req.files แบบเติม s
    // console.log(req.files); // {รายละเอียดข้อมูลไฟล์ที่เราอัพโหลดใน postman}
    if (!req.files) {
      //ถ้า req.files = undefined คือถ้าจะอัพเดทรูปโปรไฟล์ แต่ไม่ได้ส่งรูปมา
      return next(createError("profile image or cover image is required"));
    }

    const response = {};

    if (req.files.profileImage) {
      //เราจะอัพโหลดรูปที่มี ไปที่ cloudinary (ทำงานแบบ asynchronous ทั้งหมดเลย)
      const url = await upload(req.files.profileImage[0].path);
      //return ค่าเป็น promise obj, ใส่ [0] เพราะ req.files return array แล้วเราตั้งไว้ว่ามีรูปเดียว = index 0
      response.profileImage = url;
      await prisma.user.update({
        data: {
          profileImage: url,
        },
        where: {
          id: req.user.id, // req.user มาจาก middleware
        },
      });
    }

    if (req.files.coverImage) {
      const url = await upload(req.files.coverImage[0].path);
      response.coverImage = url;
      await prisma.user.update({
        data: {
          coverImage: url,
        },
        where: {
          id: req.user.id,
        },
      });
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profileImage) {
      fs.unlink(req.files.profileImage[0].path);
    }
    if (req.files.coverImage) {
      fs.unlink(req.files.coverImage[0].path);
    }
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { error } = checkUserIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const userId = +req.params.userId;
    //ต้องไปหาข้อมูลของ user ตามนี้
    const user = await prisma.user.findUnique({
      //ถ้าหาไม่เจอจะเป็น null
      where: {
        id: userId,
      },
    });

    let status = null; //เอาไว้แก้ bug เรื่อง status กับคนที่ไม่มีอยู่จริง = ถ้า user ไม่มีค่า หรือหาไม่เจอ status ควรเป็น null
    let friends = null;
    if (user) {
      //ต้องใส่ if(user) เพราะว่าถ้าไม่เจอ แล้วเป็น null มันจะทำให้ error
      delete user.password;
      status = await getTargetUserStatusWithAuthUser(userId, req.user.id);
      friends = await getTargetUserFriends(userId);
    }

    res.status(200).json({ user, status, friends });
    //ผ่าน key ที่ชื่อ user และ value จาก user ข้างบน, status คือต้องบอกว่า user เป็นอะไรกัน
  } catch (err) {
    next(err);
  }
};
