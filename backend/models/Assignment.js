// backend/models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    allocationPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
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
    role: {
      type: String,
      required: true,
      trim: true,
      default: "Developer",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent overlapping assignments
assignmentSchema.index({ engineerId: 1, startDate: 1, endDate: 1 });

// Pre-save validation to check capacity
assignmentSchema.pre("save", async function (next) {
  try {
    const User = mongoose.model("User");
    const engineer = await User.findById(this.engineerId);

    if (!engineer) {
      throw new Error("Engineer not found");
    }

    // Find overlapping assignments (excluding current assignment if updating)
    const query = {
      engineerId: this.engineerId,
      $or: [
        {
          startDate: { $lte: this.startDate },
          endDate: { $gte: this.startDate },
        },
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.endDate },
        },
        {
          startDate: { $gte: this.startDate },
          endDate: { $lte: this.endDate },
        },
      ],
    };

    // Exclude current assignment if updating
    if (!this.isNew) {
      query._id = { $ne: this._id };
    }

    const overlappingAssignments = await mongoose
      .model("Assignment")
      .find(query);

    // Calculate total allocation during overlap period
    const totalAllocation =
      overlappingAssignments.reduce((sum, assignment) => {
        return sum + assignment.allocationPercentage;
      }, 0) + this.allocationPercentage;

    if (totalAllocation > engineer.maxCapacity) {
      throw new Error(
        `Assignment exceeds engineer capacity. Available: ${
          engineer.maxCapacity - (totalAllocation - this.allocationPercentage)
        }%, Requested: ${this.allocationPercentage}%`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Check if assignment is currently active
assignmentSchema.methods.isActive = function () {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
};

// Get assignment duration in days
assignmentSchema.methods.getDurationInDays = function () {
  const timeDiff = this.endDate - this.startDate;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model("Assignment", assignmentSchema);
