// backend/models/Project.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    teamSize: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["planning", "active", "completed"],
      default: "planning",
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Get current team size
projectSchema.methods.getCurrentTeamSize = async function () {
  const Assignment = mongoose.model("Assignment");
  const now = new Date();

  const activeAssignments = await Assignment.countDocuments({
    projectId: this._id,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  return activeAssignments;
};

// Check if project needs more team members
projectSchema.methods.needsMoreMembers = async function () {
  const currentSize = await this.getCurrentTeamSize();
  return currentSize < this.teamSize;
};

module.exports = mongoose.model("Project", projectSchema);
