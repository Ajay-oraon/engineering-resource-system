const express = require("express");
const {
  getEngineers,
  getEngineerCapacity,
} = require("../controllers/engineerController");
const { auth,requireManager } = require("../middlewares/auth");
const router = express.Router();

router.get("/", auth,requireManager, getEngineers);
router.get("/:id/capacity", auth, getEngineerCapacity);

module.exports = router;
