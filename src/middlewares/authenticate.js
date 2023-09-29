const createError = require("../utils/create-error");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prisma");

module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      // ถ้า authorization ไม่มีค่า แปลว่าเค้าไม่ได้ส่งสิ่งที่จะยืนยันตัวตนมา
      // หรือถ้าไม่ได้ขึ้นต้นด้วยคำว่า Bearer เว้นวรรค
      // ให้มันวิ่งไปทำงานที่ createError middleware
      return next(createError("unauthenticated", 401));
    }
    const token = authorization.split(" ")[1]; // index 0 = Bearer, index 1 = ก้อน token
    // ถ้า verify ผ่าน = สำเร็จ จะได้ค่า payload (แปลว่า user คนนั้นมีอยู่)
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "dddrrrdfggdd"
    );

    // ค้นหา user ว่าข้อมูลใน payload มี id อยู่ใน payload ไหม
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return next(createError("unauthenticated", 401));
    }

    delete user.password;
    // แต่ถ้า user มีค่า ก็เพิ่ม key user ให้มีค่าเท่ากับ user ที่เราไปหามา
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      // Token... กับ JsonWeb... เอามาจาก doc
      err.statusCode = 401;
    }
    next(err);
  }
};
