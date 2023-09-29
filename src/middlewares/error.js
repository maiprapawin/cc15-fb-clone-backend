module.exports = (err, req, res, next) => {
  console.log(err); // ให้เรารู้เอง หา bug ง่าย
  // res.status(500).json({ message: err.message }); // ส่งไปให้ frontend เค้าจะได้รู้ว่า err เกิดจากอะไร เอาไว้ใช้แค่ตอน dev ตอนของจริงคนไม่ควรรู้ว่าเกิด err เพราะอะไร
  if (err.name === "ValidationError") {
    err.statusCode = 400;
  }
  res.status(err.statusCode || 500).json({ message: err.message });
};
