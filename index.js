require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//Router
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const tweetRouter = require("./routes/tweet");
const followRouter = require("./routes/follow");

//Database connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connect to : " + process.env.DATABASE);
  });

//middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//Routes
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", tweetRouter);
app.use("/api", followRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("app running on " + port);
});
