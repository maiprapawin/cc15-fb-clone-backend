const fs = require("fs/promises");

const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const { checkUserIdSchema } = require("../validators/user-validator");

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
    if (user) delete user.password; //ต้องใส่ if(user) เพราะว่าถ้าไม่เจอ แล้วเป็น null มันจะทำให้ error
    res.status(200).json({ user }); //ผ่าน key ที่ชื่อ user และ value จาก user ข้างบน
  } catch (err) {
    next(err);
  }
};
