const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const tweetSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "Profile",
      required: true,
    },
    tweet: {
      type: String,
      maxlength: 200,
      trim: true,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    picture: {
      data: Buffer,
      contentType: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tweet", tweetSchema);
