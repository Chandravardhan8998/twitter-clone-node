const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    maxlength: 200,
    trim: true,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: "Profile",
  },
  to: {
    type: ObjectId,
    ref: "Profile",
  },
  tweetId: {
    type: ObjectId,
    ref: "Tweet",
  },
});

const Reply = mongoose.model("Reply", replySchema);

const reactSchema = new mongoose.Schema({
  tweetId: {
    type: ObjectId,
    ref: "Tweet",
  },
  userId: {
    type: ObjectId,
    ref: "Profile",
  },
});

const React = mongoose.model("React", reactSchema);

module.exports = {
  Reply,
  React,
};
