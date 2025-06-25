// backend/routes/assignments.js
const express = require("express");
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getMyAssignments,
} = require("../controllers/assignmentController");
const { auth, requireManager } = require("../middlewares/auth");

const router = express.Router();

router.get("/", auth, getAssignments);
router.get("/my", auth, requireManager, getMyAssignments);
router.post("/", auth, requireManager, createAssignment);
router.put("/:id", auth, requireManager, updateAssignment);
router.delete("/:id", auth, requireManager, deleteAssignment);

module.exports = router;
