module.exports = (req, res, next) => {
  res.status(404).json({ message: "resource not found on this server" });
};

////server ไม่รองรับ เช่นเรายิง postman แล้วลืมเขียนอะไรไป จะได้รู้ว่าเกิดอะไรขึ้น มาแก้ปัญหาได้
