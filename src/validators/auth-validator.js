const Joi = require("joi"); //เอามาช่วย validate ตอน user register

///////

///// REGISTER - Logic
const registerSchema = Joi.object({
  // เราจะ validate req body (ตามที่เราดีไซน์ไว้ใน design.txt = มี key 5 ตัว = เราต้องสร้าง schema ให้เป็น obj ที่มี key 5 ตัว ชื่อ key จะต้องตรงกับที่เราดีไซน์ไว้)
  // trim() >> eg. "  John " => "John" มันจะ trim แล้วเปลี่ยนค่าไปเลย คือสิ่งที่ return ออกมาจากที่ validate แล้วเปลี่ยนค่าให้เลย คือตัดพื้นที่ว่างออกไปเลย = ตอน insert into database เราก็จะกลายเป็นค่าที่ trim แล้ว
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  emailOrMobile: Joi.alternatives([
    /// alternatives ก็คือ มันจะ test ว่าต้องเป็นอย่างใดอย่างหนึ่งในสองอันนี้ มันถึงจะ validate ผ่าน ///
    // เป็นอะไรก็ได้ = string/number = ok
    // , = หรือ เช่น email หรือ phone
    // /^[0-9]{10}/ = [ค่าที่เป็นไปได้] ขึ้นต้นด้วย 0-9 มีจำนวนได้ 10 ตัว
    Joi.string().email(),
    Joi.string().pattern(/^[0-9]{10}$/),
    // หลัง validate เสร็จแล้ว เอา email/mobile ออกไปเลย
  ])
    .required()
    .strip(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .trim()
    .required(),
  //เป็นไปได้ 6-30 ตัว = password อย่างน้อย 6-30 ตัว, required = จำเป็นต้องกรอก password
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
  //.strip() เอาไว้ตัดมันออกไปจากระบบ เพราะตอนที่เรา insert ข้อมูลเข้าไปใน database โดยใช้ prisma มันไม่จำเป็นแล้ว ก็คือหลังจาก validate เสร็จแล้วให้ตัดข้อมูล cfpw ออกไปเลย
  mobile: Joi.forbidden().when("emailOrMobile", {
    is: Joi.string().pattern(/^[0-9]{10}$/),
    then: Joi.string().default(Joi.ref("emailOrMobile")),
  }),
  // forbidden = ตอนที่ validate ห้ามมี key ชื่อ mobile เข้ามาเด็ดขาด
  // ถ้า emailOrMobile เป็น string
  email: Joi.forbidden().when("emailOrMobile", {
    is: Joi.string().email(),
    then: Joi.string().default(Joi.ref("emailOrMobile")),
  }),
});

exports.registerSchema = registerSchema;

/* แบบ clean = หาฝึกเองจ้า 
// const validate = schema => input => {
//     // เขียน fn ขึ้นมาตัวนึงที่รับ para เป็น schema แล้ว return ค่าเป็น fn
// }
// // exports.registerSchema = registerSchema;
// exports.validateRegister = validate(registerSchema)
// // input => {....มี logic อยู่ข้างในนี้...}

// exports.validate = input => {
//       const { value, error } = loginSchema.validate(input);
//       if (error) {
//       }
// }
*/

///// LOGIN - Logic
const loginSchema = Joi.object({
  emailOrMobile: Joi.string().required(),
  password: Joi.string().required(),
});

exports.loginSchema = loginSchema;
