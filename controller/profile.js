const { Profile } = require("../models/profile");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { Follow } = require("../models/profile");
//middleware

//NOTE - Upload Image
exports.uploadPicture = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    let picture;
    //handle file here
    if (file.picture) {
      if (file.picture.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          error: "file size is too big !!",
        });
      }
      picture = {
        picture: {
          data: fs.readFileSync(file.picture.path),
          contentType: file.picture.type,
        },
      };
    }

    //save to DB
    Profile.findByIdAndUpdate(
      { _id: req.auth._id },
      { $set: picture },
      { new: true, useFindAndModify: false }
    ).exec((err, picture) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to save image in DB.",
        });
      }
      res.json(picture);
    });
  });
};

exports.picture = (req, res) => {
  res.set("Content-Type", req.profile.picture.contentType);
  res.send(req.profile.picture.data);
};

exports.getProfileByName = (req, res, next, id) => {
  Profile.findOne({ username: id }).exec((err, profile) => {
    if (err || !profile) {
      return res.status(400).json({
        error: "Not Found",
      });
    }
    req.profile = profile;
    req.profile.salt = undefined;
    req.profile.password_hash = undefined;
    next();
  });
};

//******** controller ********//

// read profile
exports.getProfile = async (req, res) => {
  const me = req.auth._id;
  const followYou = await followOrNot({
    userId: req.profile._id,
    to: me,
  });
  const youFollow = await followOrNot({
    userId: me,
    to: req.profile._id,
  });

  const followers = await countFollowersOrFollowing(req.profile._id, true);
  const following = await countFollowersOrFollowing(req.profile._id, false);
  req.profile._doc.followYou = followYou;
  req.profile._doc.youFollow = youFollow;

  req.profile._doc.followers = followers;
  req.profile._doc.following = following;

  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;

  req.profile.salt = undefined;
  req.profile.password_hash = undefined;
  req.profile.picture = undefined;
  return res.json(req.profile);
};

// edit profile
exports.updateProfile = (req, res) => {
  //sanitize username
  if (req.body.username) {
    req.body.username = req.body.username.replace(" ", "_").replace(",", "_");
  }

  delete req.body.email;
  delete req.body.password_hash;
  delete req.body.salt;

  Profile.findOneAndUpdate(
    { username: req.profile.username },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, profile) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to update",
        });
      }
      profile.salt = undefined;
      profile.password_hash = undefined;
      profile.picture = undefined;
      res.json(profile);
    }
  );
};

//find follow or not
function followOrNot(req) {
  return Follow.exists(req);
}

// search user
exports.searchUserByName = (req, res, next, id) => {
  Profile.where({})
    .select("name username")
    .exec((err, users) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to find",
        });
      }
      req.users = users;
      next();
    });
};
exports.searchResult = (req, res) => {
  return res.json(req.users);
};

async function countFollowersOrFollowing(id, bool = true) {
  return bool
    ? await Follow.countDocuments({ to: id }).exec()
    : await Follow.countDocuments({ userId: id }).exec();
}
