const { Reply } = require("../models/reply");
// SECTION Tweet Reply
// SECTION Tweet Middleware
exports.getReplyById = (req, res, next, id) => {
  Reply.findById(id)
    .populate("userId", "name username")
    .exec((err, reply) => {
      if (err) {
        return res.status(400).json({
          error: "Not found!",
        });
      }
      req.reply = reply;
      next();
    });
};
// SECTION Tweet Controllers

exports.leaveReply = (req, res) => {
  const auth = req.auth;
  const reply = new Reply(req.body);
  const tweet = req.tweet;
  reply.userId = auth._id;
  reply.to = tweet.userId;
  reply.tweetId = tweet._id;

  reply.save((err, reply) => {
    if (err || !reply) {
      return res.status(400).json({
        error: "Failed to save in DB",
      });
    }
    res.json(reply);
  });
};

exports.readReply = (req, res) => {
  res.json(req.reply);
};

exports.readReplies = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 5;
  Reply.find({ tweetId: req.tweet._id })
    .populate("userId", "name username")
    .limit(limit)
    .sort([["createdAt", "desc"]])
    .exec((err, replies) => {
      if (err) {
        return res.status(400).json({
          error: "Not Found!",
        });
      }
      res.json(replies);
    });
};

exports.deleteReply = (req, res) => {
  const reply = req.reply;
  reply.remove((err, reply) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete reply!",
      });
    }
    res.json({
      message: `Successfully deleted!`,
    });
  });
};
