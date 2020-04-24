const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { signup, signin, signout } = require("../controller/auth");

const checker = [
  check("name", "name should be at least 3 char").isLength({
    min: 3
  }),
  check("email", "email is require").isEmail(),
  check("password", "password should be at least 6 char").isLength({
    min: 6
  })
];

router.post("/signup", checker, signup);
router.post("/signin", signin);
router.get("/signout", signout);

module.exports = router;
