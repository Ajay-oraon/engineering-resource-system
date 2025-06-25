// backend/controllers/projectController.js
const Project = require("../models/Project");
const User = require("../models/User");
const Assignment = require("../models/Assignment");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { status, managerId } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (managerId) filter.managerId = managerId;

    const projects = await Project.find(filter)
      .populate("managerId", "name email")
      .sort({ createdAt: -1 });

    // Add team information to each project
    const projectsWithTeam = await Promise.all(
      projects.map(async (project) => {
        const currentTeamSize = await project.getCurrentTeamSize();
        const needsMoreMembers = await project.needsMoreMembers();

        return {
          ...project.toObject(),
          currentTeamSize,
          needsMoreMembers,
        };
      })
    );

    res.json(projectsWithTeam);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Manager only)

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, requiredSkills, teamSize } =
      req.body;

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !teamSize) {
      return res.status(400).json({
        message:
          "Name, description, start date, end date, and team size are required",
      });
    }
    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const project = new Project({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      requiredSkills: requiredSkills || [],
      teamSize,
      managerId: req.user.id,
    });

    await project.save();

    // Populate manager info and return
    await project.populate("managerId", "name email");

    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "managerId",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get project assignments with engineer details
    const assignments = await Assignment.find({ projectId: project._id })
      .populate("engineerId", "name email skills seniority")
      .sort({ startDate: 1 });

    const currentTeamSize = await project.getCurrentTeamSize();
    const needsMoreMembers = await project.needsMoreMembers();

    res.json({
      ...project.toObject(),
      currentTeamSize,
      needsMoreMembers,
      assignments,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager only)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is the project manager
    if (
      project.managerId.toString() !== req.user.id &&
      req.user.role !== "manager"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
    } = req.body;

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);
    if (requiredSkills) project.requiredSkills = requiredSkills;
    if (teamSize) project.teamSize = teamSize;
    if (status) project.status = status;

    await project.save();
    await project.populate("managerId", "name email");

    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Manager only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is the project manager
    if (
      project.managerId.toString() !== req.user.id &&
      req.user.role !== "manager"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    // Delete all assignments for this project
    await Assignment.deleteMany({ projectId: project._id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
