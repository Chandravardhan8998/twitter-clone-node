const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");
const { ObjectId } = mongoose.Schema;

const followSchema = new mongoose.Schema(
  {
    //This Follower is
    userId: {
      type: ObjectId,
      ref: "Profile",
    },
    //Following to this
    to: {
      type: ObjectId,
      ref: "Profile",
    },
  },
  {
    timestamps: true,
  }
);

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trime: true,
      maxlength: 30,
      required: true,
    },
    email: {
      type: String,
      trime: true,
      maxlength: 30,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    salt: String,
    bio: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    birthdate: {
      type: Date,
      default: "",
    },
    picture: {
      data: Buffer,
      contentType: String,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.pre("save", function (next) {
  const user = this;
  if (user.email) {
    const email = user.email;
    let username = email.substring(0, email.indexOf("."));
    user.username = username;
    next();
  }
  throw new Error("Email");
});

profileSchema
  .virtual("password")
  .set(function (password) {
    this.$password = password;
    this.salt = uuidv1();
    this.password_hash = this.securePassword(password);
  })
  .get(function () {
    return this.$password;
  });

profileSchema.methods = {
  authenticate: function name(plainPassword) {
    return this.securePassword(plainPassword) === this.password_hash;
  },
  securePassword: function (plainPassword) {
    if (!plainPassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainPassword)
        .digest("hex");
    } catch (error) {
      return "";
    }
  },
};
const Profile = mongoose.model("Profile", profileSchema);
const Follow = mongoose.model("Follow", followSchema);

module.exports = {
  Profile,
  Follow,
};
