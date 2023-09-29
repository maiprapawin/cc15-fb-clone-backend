const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/auth-validator");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");

//////// REGISTER //////////
exports.register = async (req, res, next) => {
  try {
    ///// 1. read ค่าใน body
    ///// 2. validate โดยใช้ joi ช่วย
    // const result = registerSchema.validate(req.body);
    const { value, error } = registerSchema.validate(req.body);
    // console.log(value);
    if (error) {
      //   console.log(error);
      return next(error); //ให้ไปทำงานที่ error middleware ทันที
    }
    ///// 3. hash password
    value.password = await bcrypt.hash(value.password, 12); // 12 = salt อย่าใส่เยอะ

    // console.log(value);

    ///// 4. create ข้อมูลเข้า database //ต้องมี jsonwebtoken
    /* await prisma.user.create({
    //     data: {
    //         firstName,
    //         lastName,
    //         email: null,
    //         mobile: value.emailOrMobile, 
    //         password
    //     }
    // })
    */
    const user = await prisma.user.create({
      data: value,
    });
    const payload = { userid: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "dddssssdfjkdfjeieiei",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

//////// LOGIN //////////
exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    // ถ้า validate ไม่ผ่าน ให้ไปส่ง error เลย
    if (error) {
      // console.log(error.name) // Joi - ValidationError
      return next(error);
    }
    //// ถ้า validate ผ่าน จะมี key 2 ตัว (เราต้องไปค้นว่าในที่ user กรอกมาหรือใน req.body มีใน table user หรือเปล่า)
    // findMany => return array
    // findFirst => return obj ตัวแรกที่เจอ (เราใช้อันนี้เพราะว่าเรามั่นใจว่ามันมีข้อมูลนี้แค่แถวเดียวใน database)
    // SELECT * FROM user WHERE email = emailOrMobile OR mobile = emailOrMobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: value.emailOrMobile }, { mobile: value.emailOrMobile }],
      },
    }); //ถ้าหาไม่เจอ จะได้ค่าเป็น null
    if (!user) {
      return next(createError("invalid credential", 400));
    }
    /// ถ้าหา user เจอแล้ว เราจะต้องเอา password ไป compare กับตอนที่เค้า signup มา
    // value.password = ค่าที่อยู่ใน req.body
    // user.password = from database
    // return boolean = เขียนตัวแปรมารับ
    const isMatch = await bcrypt.compare(value.password, user.password);
    // await รอให้มันทำงานให้เสร็จ แล้วเอาไปเช็ค
    if (!isMatch) {
      return next(createError("invalid credential", 400));
      //ใช้อันนี้เพื่อความปลอดภัย ไม่ให้คนรู้ว่ามันไม่ถูกตรงไหนเมลหรือรหัสผ่าน ทำให้คนแฮคยากขึ้น
    }
    /// Client sends req to server, server validate login, compare password, if ok = gen accessToken and send back to client => client stores it in local storage
    // เราจะ gen access token เลยต้องมี payload
    const payload = { userid: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "dddssssdfjkdfjeieiei",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    delete user.password;
    res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
};
