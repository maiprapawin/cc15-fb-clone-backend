const fs = require("fs/promises");
const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const prisma = require("../models/prisma");
const { STATUS_ACCEPTED } = require("../config/constant");

//fn ที่หา id ของเพื่อนของ targetUserId
const getFriendIds = async (targetUserId) => {
  const relationship = await prisma.friend.findMany({
    where: {
      OR: [{ receiverId: targetUserId }, { requesterId: targetUserId }],
      status: STATUS_ACCEPTED,
    },
  });

  const friendIds = relationship.map((el) =>
    el.requesterId === targetUserId ? el.receiverId : el.requesterId
  );
  return friendIds;
};

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
  } finally {
    //เอาไว้ลบรูปใน public
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};

exports.getAllPostIncludeFriendPost = async (req, res, next) => {
  try {
    //หา id ของเพื่อนทั้งหมด (ไปเขียน fn ไว้ข้างยน)
    const friendIds = await getFriendIds(req.user.id); // = targetUser คนที่เป็น user ที่ลอคอินตอนนี้ // [3, 9, 1]
    const posts = await prisma.post.findMany({
      // SELECT * FROM posts WHERE userId in (3, 9, 1)
      where: {
        userId: {
          in: [...friendIds, req.user.id], //เอาของเก่ามา แล้วเอาของตัวเองเข้าไป
        },
      },
      orderBy: {
        createdAt: "desc", //เอา post ที่ create ล่าสุดไว้ข้างบน
      },
      include: {
        user: {
          select: {
            //เอาแค่บางอัน ไม่เอา password
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};
