const express = require("express");
const router = express.Router();

const { isSignedIn, isAuthenticate } = require("../controller/auth");
const {
  getProfile,
  getProfileById,
  getProfileByName,
} = require("../controller/profile");
const { follow, getFollower, getFollowing } = require("../controller/follow");

//Params
router.param("userId", getProfileByName);
// router.param("userId", getProfileById);

//ROUTES

router.post("/follow/:userId", isSignedIn, follow);

router.get("/following/:userId", isSignedIn, getFollowing);
router.get("/follower/:userId", isSignedIn, getFollower);

module.exports = router;
