const { rateLimit } = require("express-rate-limit");

module.exports = rateLimit({
  //   windowMs: 15 * 60 * 1000, // = 15 นาที
  windowMs: 60 * 1000, // 1 นาที
  limit: 100, // ได้กี่ req ต่อ 1 IP
  message: { message: "Too many requests from this IP" },
});
