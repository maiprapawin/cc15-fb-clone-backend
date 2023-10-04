const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const split = file.originalname.split(".");
    cb(
      null,
      "" +
        Date.now() +
        Math.round(Math.random() * 10000000) +
        "." +
        split[split.length - 1]
    ); //เอาชื่อไฟล์เป็นเวลา ถ้าไม่ได้อัพโหลดรูปพร้อมกัน
  },
});

// req = multer pass ค่า req obj ให้เราใช้ได้
// file = ข้อมูลไฟล์รูปที่เราอัพ เช่น original name, file info
// cb = callback fn รับ - para1 บอกว่า err เกิดขึ้น แต่ถ้าไม่อยากให้มี error ก็ต้อง pass ค่าเป็น null
// - cb(new Error())
// - cb(null,..)
// para2 เป็น path ที่เราจะเก็บรูป

const upload = multer({ storage: storage });
module.exports = upload;
