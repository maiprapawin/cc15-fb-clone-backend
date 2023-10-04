const cloudinary = require("../config/cloudinary");

exports.upload = async (path) => {
  const result = await cloudinary.uploader.upload(path);
  return result.secure_url; //เพราะค่าอื่นๆเราไม่ได้ใช้เลย
};
