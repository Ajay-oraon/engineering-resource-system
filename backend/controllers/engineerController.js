const User = require("../models/User");
const Assignment = require("../models/Assignment");

// @desc    Get all engineers
// @route   GET /api/engineers
// @access  Private

const getEngineers=async(req,res)=>{
    try {
      const { skills, seniority, available } = req.query;
      // Build filter object
      const filter = { role: "engineer" };

      if (skills) {
        const skillArray = skills.split(",");
        filter.skills = { $in: skillArray };
      }

      if (seniority) {
        filter.seniority = seniority;
      }

      const engineers = await User.find(filter).select("-password");

      // Add capacity information to each engineer
      const engineersWithCapacity = await Promise.all(
        engineers.map(async (engineer) => {
          const availableCapacity = await engineer.getAvailableCapacity();
          const currentWorkload = await engineer.getCurrentWorkload();

          return {
            ...engineer.toObject(),
            availableCapacity,
            currentWorkload: Math.round(currentWorkload),
          };
        })
      );

      // Filter by availability if requested
      let filteredEngineers = engineersWithCapacity;
      if (available) {
        const minAvailability = parseInt(available);
        filteredEngineers = engineersWithCapacity.filter(
          (engineer) => engineer.availableCapacity >= minAvailability
        );
      }

      res.json(filteredEngineers);
    } catch (error) {
        console.error("Get engineers error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// @desc    Get engineer capacity details
// @route   GET /api/engineers/:id/capacity
// @access  Private
const getEngineerCapacity = async (req, res) => {
    try {
      const engineer = await User.findById(req.params.id);
      if (!engineer || engineer.role !== 'engineer') {
        return res.status(404).json({ message: 'Engineer not found' });
      }
      
      // Get current assignments
      const now = new Date();
      const activeAssignments = await Assignment.find({
        engineerId: engineer._id,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('projectId', 'name');
      
      // Get upcoming assignments
      const upcomingAssignments = await Assignment.find({
        engineerId: engineer._id,
        startDate: { $gt: now }
      }).populate('projectId', 'name');
      
      const availableCapacity = await engineer.getAvailableCapacity();
      const currentWorkload = await engineer.getCurrentWorkload();
      
      res.json({
        engineer: {
          id: engineer._id,
          name: engineer.name,
          maxCapacity: engineer.maxCapacity,
          availableCapacity,
          currentWorkload: Math.round(currentWorkload)
        },
        activeAssignments: activeAssignments.map(assignment => ({
          id: assignment._id,
          projectName: assignment.projectId.name,
          allocation: assignment.allocationPercentage,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          role: assignment.role
        })),
        upcomingAssignments: upcomingAssignments.map(assignment => ({
          id: assignment._id,
          projectName: assignment.projectId.name,
          allocation: assignment.allocationPercentage,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          role: assignment.role
        }))
      });
    } catch (error) {
      console.error('Get engineer capacity error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = {
    getEngineers,
    getEngineerCapacity
  };