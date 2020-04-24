const express = require("express");
const router = express.Router();

const {
  updateProfile,
  getProfile,
  uploadPicture,
  getProfileById,
  picture,
  searchUserByName,
  searchResult,
  getProfileByName,
} = require("../controller/profile");
const { isAuthenticate, isSignedIn } = require("../controller/auth");
//Param extractor
router.param("username", getProfileByName);
// router.param("username", getProfileById);
router.param("text", searchUserByName);
//upload image
router.put(
  "/profile/:username/upload/picture",
  isSignedIn,
  isAuthenticate,
  uploadPicture
);
//read
router.get("/profile/:username", isSignedIn, getProfile);
router.get("/profile/:username/picture", picture);
//edit
router.put(
  "/profile/:username/edit",
  isSignedIn,
  isAuthenticate,
  updateProfile
);

//search
router.get("/search/:text", searchResult);
module.exports = router;
