// backend/routes/projects.js
const express = require("express");
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { auth, requireManager } = require("../middlewares/auth");

const router = express.Router();

router.get("/", auth, getProjects);
router.post("/", auth, requireManager, createProject);
router.get("/:id", auth, getProject);
router.put("/:id", auth, requireManager, updateProject);
router.delete("/:id", auth, requireManager, deleteProject);

module.exports = router;
