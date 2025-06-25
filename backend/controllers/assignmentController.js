// backend/controllers/assignmentController.js
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const Project = require("../models/Project");

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private

const getAssignments = async (req, res) => {
  try {
    const { engineerId, projectId, status } = req.query;

    // Build filter object
    const filter = {};
    if (engineerId) filter.engineerId = engineerId;
    if (projectId) filter.projectId = projectId;

    let assignments = await Assignment.find(filter)
      .populate("engineerId", "name email skills seniority")
      .populate("projectId", "name status startDate endDate")
      .sort({ startDate: -1 });

    // Filter by status if provided
    if (status) {
      const now = new Date();
      assignments = assignments.filter((assignment) => {
        switch (status) {
          case "active":
            return assignment.startDate <= now && assignment.endDate >= now;
          case "upcoming":
            return assignment.startDate > now;
          case "completed":
            return assignment.endDate < now;
          default:
            return true;
        }
      });
    }

    // Add status to each assignment
    const assignmentsWithStatus = assignments.map((assignment) => {
      const now = new Date();
      let assignmentStatus = "completed";

      if (assignment.startDate <= now && assignment.endDate >= now) {
        assignmentStatus = "active";
      } else if (assignment.startDate > now) {
        assignmentStatus = "upcoming";
      }

      return {
        ...assignment.toObject(),
        status: assignmentStatus,
        duration: assignment.getDurationInDays(),
      };
    });

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    get assignment for engineer
// @route   POST /api/assignments
// @access  Private (Manager only)

const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ engineerId: req.user.id })
      .populate("projectId", "name status startDate endDate")
      .sort({ startDate: -1 });

    res.json(assignments);
  } catch (error) {
    console.error("Get my assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Manager only)
const createAssignment = async (req, res) => {
  try {
    const {
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    } = req.body;

    // Validate required fields
    if (
      !engineerId ||
      !projectId ||
      !allocationPercentage ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Engineer, project, allocation percentage, start date, and end date are required",
      });
    }

    // Validate engineer exists and is an engineer
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found" });
    }

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Validate allocation percentage
    if (allocationPercentage < 1 || allocationPercentage > 100) {
      return res.status(400).json({
        message: "Allocation percentage must be between 1 and 100",
      });
    }

    const assignment = new Assignment({
      engineerId,
      projectId,
      allocationPercentage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      role: role || "Developer",
    });

    await assignment.save();

    // Populate and return
    await assignment.populate([
      { path: "engineerId", select: "name email skills seniority" },
      { path: "projectId", select: "name status" },
    ]);

    res.status(201).json({
      ...assignment.toObject(),
      duration: assignment.getDurationInDays(),
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    if (error.message.includes("exceeds engineer capacity")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Manager only)
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const { allocationPercentage, startDate, endDate, role } = req.body;

    // Update fields
    if (allocationPercentage) {
      if (allocationPercentage < 1 || allocationPercentage > 100) {
        return res.status(400).json({
          message: "Allocation percentage must be between 1 and 100",
        });
      }
      assignment.allocationPercentage = allocationPercentage;
    }

    if (startDate) assignment.startDate = new Date(startDate);
    if (endDate) assignment.endDate = new Date(endDate);
    if (role) assignment.role = role;

    // Validate dates
    if (assignment.endDate <= assignment.startDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    await assignment.save();

    // Populate and return
    await assignment.populate([
      { path: "engineerId", select: "name email skills seniority" },
      { path: "projectId", select: "name status" },
    ]);

    res.json({
      ...assignment.toObject(),
      duration: assignment.getDurationInDays(),
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    if (error.message.includes("exceeds engineer capacity")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Manager only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getMyAssignments,
};
