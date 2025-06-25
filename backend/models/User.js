const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unquie: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["engineer", "manager"],
      required: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    seniority: {
      type: String,
      enum: ["junior", "mid", "senior"],
      required: function () {
        return this.role === "engineer";
      },
    },
    maxCapacity: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    department: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

//Hash password before saving

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate available capacity
userSchema.methods.getAvailableCapacity = async function () {
  const Assignment = mongoose.model("Assignment");
  const now = new Date();

  const activeAssignments = await Assignment.find({
    engineerId: this._id,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  const totalAllocated = activeAssignments.reduce((sum, assignment) => {
    return sum + assignment.allocationPercentage;
  }, 0);

  return Math.max(0, this.maxCapacity - totalAllocated);
};

// Get current workload percentage
userSchema.methods.getCurrentWorkload = async function () {
  const availableCapacity = await this.getAvailableCapacity();
  return ((this.maxCapacity - availableCapacity) / this.maxCapacity) * 100;
};

module.exports = mongoose.model("User", userSchema);
