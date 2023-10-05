require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

///
const notFoundMiddleWare = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");
const rateLimitMiddleware = require("./middlewares/rate-limit");
const authRoute = require("./routes/auth-route");
const userRoute = require("./routes/user-route");
const friendRoute = require("./routes/friend-route");

const app = express();

/// Middleware ของคนอื่นที่เราจะใช้
app.use(cors()); // allow ทุก origin
app.use(morgan("dev")); // dev = เอาไว้ log ตอน develop
app.use(rateLimitMiddleware); //ไว้ล่าง cors เพราะมันจะได้ไม่นับ preflight request
app.use(express.json()); // Express - json เพื่อพาส body
app.use(express.static("public")); //กรณีที่อยากเอารูปที่อยู่ใน public ไปใช้ ก็สามารถ req ไฟล์ในนี้ไปใช้ได้ อะไรก็ตามที่อยู่ใน public ให้บุคคลภายนอกเข้าถึงไฟล์ในนี้ได้

/// Routes ที่เราสร้าง
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/friend", friendRoute);

/// Middleware ที่เราสร้างเอง
app.use(notFoundMiddleWare);
app.use(errorMiddleware);

const PORT = process.env.PORT || "5000";
app.listen(PORT, () => console.log(`server running on port: ${PORT}`));
