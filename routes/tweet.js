const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { isAuthenticate, isSignedIn, isWorthy } = require("../controller/auth");
const { getProfileByName } = require("../controller/profile");

const {
  deleteReply,
  getReplyById,
  leaveReply,
  readReplies,
  readReply,
} = require("../controller/reply");

const {
  createTweet,
  getTweetById,
  readTweet,
  getTimeline,
  readTweetPic,
  readAllTweet,
  deleteTweet,
  reactTweet,
  getReactUser,
} = require("../controller/tweet");

//Param extractor
router.param("userId", getProfileByName);
router.param("tweetId", getTweetById);
router.param("replyId", getReplyById);

//Router
//Create tweet

router.post(
  "/tweet/create/:userId",
  [
    check("tweet", "Tweet shoudn't be more than 200 char.").isLength({
      max: 200,
    }),
  ],
  isSignedIn,
  isAuthenticate,
  createTweet
);

//Read tweet
router.get("/tweet/:tweetId", isSignedIn, readTweet);
router.get("/tweets/:userId", isSignedIn, readAllTweet);
router.get("/tweet/:tweetId/picture", readTweetPic);
router.get("/timeline/:userId", isSignedIn, isAuthenticate, getTimeline);

//Update

//Delete
router.delete(
  "/tweet/:tweetId/delete",
  isSignedIn,
  isAuthenticate,
  deleteTweet
);

// SECTION Tweet reply

router.post("/tweet/:tweetId/reply", isSignedIn, leaveReply);

router.get("/tweet/:tweetId/reply/:replyId", isSignedIn, readReply);
router.get("/tweet/:tweetId/replies", isSignedIn, readReplies);

router.delete("/reply/:replyId/delete", isSignedIn, isWorthy, deleteReply);

// SECTION Tweet like unlike
router.post("/tweet/:tweetId/react", isSignedIn, reactTweet);
router.get("/tweet/:tweetId/react/users", isSignedIn, getReactUser);

module.exports = router;
