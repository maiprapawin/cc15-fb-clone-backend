const Joi = require("joi");

const checkPostIdSchema = Joi.object({
  postId: Joi.number().integer().positive().required(),
  //obj ที่เราจะ validate มี key ชื่อว่า postId
  //เป็นตัวเลข จำนวนเต็ม เลขบวก และต้องมีค่า
});

exports.checkPostIdSchema = checkPostIdSchema;
