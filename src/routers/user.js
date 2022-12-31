const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

// express router
const router = new express.Router();

// Create user
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Read users
router.get("/users/me", auth, async (req, res, next) => {
  res.send(req.user);
});

// Update the user
router.put("/users/me", auth, async (req, res) => {
  const name = req.body.name;

  if (!name) {
    return res.status(400).send({ error: "Name required!" });
  }

  try {
    req.user["name"] = name;
    await req.user.save();
    res
      .status(200)
      .send({ user: req.user, message: "Profile updated successfully!" });
  } catch (e) {
    res.status(404).send(e);
  }
});

// Delete the user
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send("req.user");
  } catch (e) {
    res.status(500).send(e);
  }
});

// User login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({
      user,
      token,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// User logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// User logoutAll
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload image file"));
    }

    cb(undefined, true);
  },
});

// Upload profile picture
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ message: "Avatar updated successfully!", user: req.user });
  },
  (req, res, next) => {
    res.send("hi");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Delete profile picture
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send("Avatar removed successfully!");
});

// Get profile by id
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
