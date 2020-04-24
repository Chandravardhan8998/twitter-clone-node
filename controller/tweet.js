const Tweet = require("../models/tweet");
const { React, Reply } = require("../models/reply");
const { validationResult } = require("express-validator");
const { Follow } = require("../models/profile");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

//Middleware

exports.getTweetById = (req, res, next, id) => {
  Tweet.findById(id)
    .populate("userId", "name username ")
    .exec((err, tweet) => {
      if (err) {
        return res.status(400).json({
          error: "Tweet not found!",
        });
      }
      req.tweet = tweet;
      next();
    });
};

//Controllers

//create tweet
exports.createTweet = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image ",
      });
    }

    //
    let tweet = new Tweet(fields);

    if (file.picture) {
      if (!file.picture.name.match(/\.(jpg|jpeg|png)$/)) {
        return res.status(400).json({
          error: "Please upload an image",
        });
      }

      if (file.picture.size > 1 * 1024 * 1024) {
        return res.status(400).json({
          error: "file size is too big !!",
        });
      }
      tweet.picture.data = fs.readFileSync(file.picture.path);
      tweet.picture.contentType = file.picture.type;
    }
    tweet.userId = req.profile._id;

    //save to DB
    tweet.save((err, Tweet) => {
      if (err) {
        return res.status(400).json({
          error: "Twitting Failed.",
        });
      }
      res.json(Tweet);
    });
  });
};

//Read tweet
exports.readTweet = async (req, res) => {
  const reqTweet = {
    tweetId: req.tweet._id,
    userId: req.auth._id,
  };

  const replies = await Reply.find({ tweetId: reqTweet.tweetId })
    .select("text userId")
    .populate("userId", "name username")
    .exec();
  const reacts = await React.find({ tweetId: reqTweet.tweetId })
    .select("userId")
    .populate("userId", "name username")
    .exec();

  const liked = await likedOrNot(reqTweet);
  req.tweet._doc.liked = liked;
  req.tweet._doc.replies = [...replies];
  req.tweet._doc.reacts = [...reacts];
  res.json(req.tweet);
};
exports.readTweetPic = async (req, res) => {
  res.set("Content-Type", req.tweet.picture.contentType);
  res.send(req.tweet.picture.data);
};

exports.readAllTweet = async (req, res) => {
  let Tweets = await Tweet.find({ userId: req.profile._id })
    .select("-picture")
    .populate("userId", "name username ")
    .exec();

  if (Tweets.err) {
    return res.status(400).json({
      error: "Failed to find",
    });
  }

  let updatedTweets = [];

  for (let i = 0; i < Tweets.length; i++) {
    const tweet = Tweets[i];
    const reqTweet = {
      tweetId: tweet._id,
      userId: req.auth._id,
    };
    const liked = await likedOrNot(reqTweet);
    tweet._doc.liked = liked;
    updatedTweets.push(tweet._doc);
  }
  updatedTweets.sort((a, b) => b.createdAt - a.createdAt);
  res.json(updatedTweets);
};

exports.getTimeline = async (req, res) => {
  //
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let userId = req.profile._id;
  try {
    let Following = await Follow.find({ userId: userId })
      .limit(limit)
      .select("to , -_id")
      .exec();
    Following.push({
      to: req.auth._id,
    });
    let followTweets = [];
    let timelineTweets = [];

    //Get tweets of followers
    for (let i = 0; i < Following.length; i++) {
      const to = Following[i].to;
      const Tweets = await Tweet.find({ userId: to })
        .select("-picture")
        .populate("userId", "name username ")
        .limit(2)
        .sort([["createdAt", "desc"]])
        .exec();
      followTweets.push(...Tweets);
    }

    //Check liked or not
    for (let i = 0; i < followTweets.length; i++) {
      const tweet = followTweets[i];
      const reqTweet = {
        tweetId: tweet._id,
        userId: req.profile._id,
      };

      const liked = await likedOrNot(reqTweet);
      tweet._doc.liked = liked;
      timelineTweets.push(tweet._doc);
    }

    //sort by time createdAt
    timelineTweets.sort((a, b) => b.createdAt - a.createdAt);
    res.json(timelineTweets);
  } catch (error) {
    return res.status(400).json({
      error: "Failed",
    });
  }
};

exports.deleteTweet = async (req, res) => {
  const tweet = req.tweet;
  await Reply.deleteMany({ tweetId: tweet._id });

  await React.deleteMany({ tweetId: tweet._id });

  tweet.remove((err, tweet) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete tweet!",
      });
    }
    res.json({
      message: `Successfully & completly deleted!`,
    });
  });
};

//SECTION - react to tweet
exports.reactTweet = (req, res) => {
  const reactReq = {
    tweetId: req.tweet._id,
    userId: req.auth._id,
  };
  const react = new React(reactReq);
  React.exists(reactReq).then((doExist) => {
    if (!doExist) {
      react.save((err, reactRes) => {
        if (err) {
          return res.status(400).json({
            error: "Failed",
          });
        }
        res.json({
          message: "Liked",
        });
        countLikes(req.tweet._id);
      });
    } else {
      React.findOneAndDelete(reactReq, (err, reactRes) => {
        if (err) {
          return res.status(400).json({
            error: "Failed",
          });
        }
        res.json({
          message: "Unliked",
        });
        countLikes(req.tweet._id);
      });
    }
  });
};

exports.getReactUser = async (req, res) => {
  try {
    let reactors = await React.find({ tweetId: req.tweet._id })
      .select("userId")
      .populate("userId", "name username")
      .exec();
    res.json(reactors);
  } catch (error) {
    res.status(400).json({
      error: "Failed",
    });
  }
};

function countLikes(id) {
  React.countDocuments({ tweetId: id }).exec((err, res) => {
    if (err) {
      return res.status(400).json({
        error: "Failed",
      });
    }
    Tweet.findOneAndUpdate(
      { _id: id },
      { $set: { likes: res } },
      { new: true, useFindAndModify: false },
      (err, tweet) => {
        if (err) {
          return res.status(400).json({
            error: "Failed",
          });
        }
      }
    );
  });
}

//find liked Or not
function likedOrNot(req) {
  return React.exists(req);
}
