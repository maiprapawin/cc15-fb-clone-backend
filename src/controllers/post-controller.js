const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");

exports.createPost = async (req, res, next) => {
  try {
    //validate ต้องมีอย่างน้อยอย่างใดอย่างหนึ่งระหว่างรูปหรือ message
    const { message } = req.body;
    if ((!message || !message.trim()) && !req.file) {
      //trim กรณีที่ userกด space bar เป็น white space ใน post เรา
      //message จะอยู่ใน req.body ส่วนไฟล์รูปจะอยู่ใน req.file
      return next(createError("message or image is required"), 400);
    }

    const data = { userId: req.user.id }; //user ที่อยู่ใน req obj
    if (req.file) {
      // ถ้ามีรูป จะต้องอัพโหลดขึ้น clodinary
      // req.file เป็น obj ที่มี key ชื่อ path
      data.image = await upload(req.file.path); //เพิ่ม key ชื่อ image เข้าไปใน data obj
    }

    if (message) {
      data.message = message; // ถ้า message มีค่า = ให้เพิ่ม key ชื่อ message เข้าไปใน data obj เช่นกัน
    }

    // จะ create ลง table ใน db
    await prisma.post.create({
      data: data,
    });
    res.status(201).json({ message: "post created" });
  } catch (err) {
    next(err);
  }
};
