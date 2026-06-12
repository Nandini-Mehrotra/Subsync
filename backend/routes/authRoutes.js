const express = require("express");
const { signup, login } = require("../controllers/authController");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes file working" });
});

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;