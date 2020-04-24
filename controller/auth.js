const { Profile } = require("../models/profile");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { validationResult } = require("express-validator");
const { getProfile } = require("./profile");
exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new Profile(req.body);
  user.save((err, user) => {
    if (err || !user) {
      return res.status(422).json({
        error: "Failed to save in DB",
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      username: user.username,
      id: user._id,
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const { email, password } = req.body;

  Profile.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User Email Not Found!",
      });
    }
    //check password
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Failed to login!",
      });
    }
    //create token Using user id and secret key
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    //store token in cookie
    res.cookie("token", token, { expire: new Date() + 20000 });

    // send res to front end

    const { _id, name, email, username, bio, birthdate, location } = user;
    return res.json({
      token,
      user: { _id, name, email, username, bio, birthdate, location },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "SignOut User",
  });
};

// NOTE middlewares

exports.isSignedIn = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
});

exports.isAuthenticate = (req, res, next) => {
  const checker =
    (req.profile && req.auth && req.profile._id == req.auth._id) ||
    (req.tweet && req.auth && req.tweet.userId._id == req.auth._id);
  if (!checker) {
    return res.status(403).json({
      error: "Access Denied",
    });
  }
  next();
};

exports.isWorthy = (req, res, next) => {
  //check worthy for deleting comment : 2
  let worthy =
    req.auth._id == req.reply.userId._id || req.auth._id == req.reply.to;
  if (!worthy) {
    return res.status(403).json({
      error: "Access Denied",
    });
  }
  next();
};
