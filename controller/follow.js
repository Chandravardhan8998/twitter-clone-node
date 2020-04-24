const { Follow } = require("../models/profile");

exports.follow = (req, res) => {
  //manage follow and unfollow
  const followReq = {
    userId: req.auth._id,
    to: req.profile._id,
  };
  //check if same person
  if (followReq.userId == followReq.to) {
    return res.status(400).json({
      error: "Failed to follow!",
    });
  }
  const follow = new Follow(followReq);

  Follow.exists(followReq).then((doFollow) => {
    if (!doFollow) {
      follow.save((err, followRes) => {
        if (err) {
          return res.status(400).json({
            error: "Failed",
          });
        }
        res.json({
          message: "Follow",
        });
      });
    } else {
      Follow.findOneAndDelete(followReq, (err, followRes) => {
        if (err) {
          return res.status(400).json({
            error: "Failed",
          });
        }
        res.json({
          message: "Unfollow",
        });
      });
    }
  });

  // Follow.findOne(followReq, async (err, followRes) => {
  //   if (err) {
  //     return res.status(400).json({
  //       error: "Failed",
  //     });
  //   }
  // });
};

exports.getFollowing = (req, res) => {
  //
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;

  let user = req.profile._id;
  Follow.find({ userId: user })
    .limit(limit)
    .populate("to", "name username")
    .exec((err, following) => {
      if (err) {
        return res.status(400).json({
          error: "Not Found",
        });
      }
      res.json(following);
    });
};

exports.getFollower = (req, res) => {
  //
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let user = req.profile._id;
  Follow.find({ to: user })
    .populate("userId", "name username")
    .limit(limit)
    .exec((err, follower) => {
      if (err) {
        return res.status(400).json({
          error: "Not Found",
        });
      }
      res.json(follower);
    });
};
