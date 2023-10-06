const prisma = require("../models/prisma");
const { checkPostIdSchema } = require("../validators/post-validator");
const createError = require("../utils/create-error");

exports.toggleLike = async (req, res, next) => {
  try {
    // เอา schema ที่เรา create ในไฟล์ post-validator มาเรียกใช้ method validate
    const { value, error } = checkPostIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    // เช็คก่อนว่ามี post ไหม
    const existPost = await prisma.post.findUnique({
      where: {
        id: value.postId,
      },
    });

    if (!existPost) {
      return next(createError("post does not exist", 400));
    }
    // ต้องดูว่ามี like อยู่ไหม ในตาราง like table เรา ถ้ามีต้องลบ ถ้าไม่มีต้อง create
    // มีโอกาสที่ user 1 คน จะมี record กดไลค์กับ 1 post แค่อันเดียว เลยใช้ findFirst
    const existLike = await prisma.like.findFirst({
      where: {
        userId: req.user.id,
        postId: value.postId,
      },
    });

    /////// 1. กรณีที่ like มีค่าอยู่ (like อยู่) ///////
    // ถ้า like มีค่า ก็ต้องลบ like & update total like ใน post table
    if (existLike) {
      //ลบออกจากตาราง like ตาม id ที่เราหาเจอ
      await prisma.like.delete({
        where: { id: existLike.id },
      });
      //อัพเดทเลข totalLike ในตาราง post ให้ลดลงไป 1
      await prisma.post.update({
        data: {
          totalLike: {
            decrement: 1,
          },
        },
        where: {
          id: value.postId,
        },
      });
      return res.status(200).json({ message: "unliked" });
    }

    /////// 2. กรณีที่ like ยังไม่มี (ยังไม่ได้ไลค์) ///////
    //ต้องเพิ่ม data ลงตาราง like
    await prisma.like.create({
      data: {
        userId: req.user.id,
        postId: value.postId,
      },
    });
    //อัพเดท total like ในตาราง post
    await prisma.post.update({
      data: {
        totalLike: {
          increment: 1,
        },
      },
      where: {
        id: value.postId,
      },
    });
    res.status(200).json({ message: "liked" });
  } catch (err) {
    next(err);
  }
};
