// backend/seeds/seedData.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Assignment = require("../models/Assignment");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await Assignment.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

const seedUsers = async () => {
  try {
    const users = [
      // Managers
      {
        email: "manager1@company.com",
        password: "password123",
        name: "Alice Johnson",
        role: "manager",
        department: "Engineering",
      },
      {
        email: "manager2@company.com",
        password: "password123",
        name: "Bob Smith",
        role: "manager",
        department: "Product",
      },
      // Engineers
      {
        email: "john.doe@company.com",
        password: "password123",
        name: "John Doe",
        role: "engineer",
        skills: ["React", "Node.js", "JavaScript", "MongoDB"],
        seniority: "senior",
        maxCapacity: 100,
        department: "Frontend",
      },
      {
        email: "jane.smith@company.com",
        password: "password123",
        name: "Jane Smith",
        role: "engineer",
        skills: ["React", "TypeScript", "CSS", "HTML"],
        seniority: "mid",
        maxCapacity: 100,
        department: "Frontend",
      },
      {
        email: "mike.wilson@company.com",
        password: "password123",
        name: "Mike Wilson",
        role: "engineer",
        skills: ["Node.js", "Python", "MongoDB", "PostgreSQL"],
        seniority: "senior",
        maxCapacity: 100,
        department: "Backend",
      },
      {
        email: "sarah.davis@company.com",
        password: "password123",
        name: "Sarah Davis",
        role: "engineer",
        skills: ["React", "Vue.js", "JavaScript", "CSS"],
        seniority: "junior",
        maxCapacity: 50, // Part-time
        department: "Frontend",
      },
      {
        email: "alex.brown@company.com",
        password: "password123",
        name: "Alex Brown",
        role: "engineer",
        skills: ["Python", "Django", "FastAPI", "PostgreSQL"],
        seniority: "mid",
        maxCapacity: 100,
        department: "Backend",
      },
      {
        email: "lisa.taylor@company.com",
        password: "password123",
        name: "Lisa Taylor",
        role: "engineer",
        skills: ["React Native", "JavaScript", "iOS", "Android"],
        seniority: "senior",
        maxCapacity: 100,
        department: "Mobile",
      },
    ];
    // Hash passwords for all users
    for (let user of users) {
        const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
};

const seedProjects = async (users) => {
  try {
    // Find managers
    const managers = users.filter((user) => user.role === "manager");

    const now = new Date();
    const projects = [
      {
        name: "E-commerce Platform Redesign",
        description:
          "Complete redesign of the company e-commerce platform with modern UI/UX and improved performance.",
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        requiredSkills: ["React", "Node.js", "MongoDB", "CSS"],
        teamSize: 4,
        status: "active",
        managerId: managers[0]._id,
      },
      {
        name: "Mobile App Development",
        description:
          "Native mobile application for iOS and Android platforms with real-time features.",
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        requiredSkills: ["React Native", "JavaScript", "iOS", "Android"],
        teamSize: 3,
        status: "planning",
        managerId: managers[1]._id,
      },
      {
        name: "Data Analytics Dashboard",
        description:
          "Internal dashboard for business intelligence and data visualization.",
        startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        requiredSkills: ["Python", "React", "PostgreSQL"],
        teamSize: 2,
        status: "active",
        managerId: managers[0]._id,
      },
      {
        name: "API Microservices Migration",
        description:
          "Migration from monolithic architecture to microservices using modern technologies.",
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endDate: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000), // 150 days from now
        requiredSkills: ["Node.js", "Python", "MongoDB", "PostgreSQL"],
        teamSize: 3,
        status: "planning",
        managerId: managers[1]._id,
      },
      {
        name: "Legacy System Maintenance",
        description: "Ongoing maintenance and bug fixes for legacy systems.",
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        requiredSkills: ["JavaScript", "PHP", "MySQL"],
        teamSize: 1,
        status: "completed",
        managerId: managers[0]._id,
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`Created ${createdProjects.length} projects`);
    return createdProjects;
  } catch (error) {
    console.error("Error seeding projects:", error);
    throw error;
  }
};

const seedAssignments = async (users, projects) => {
  try {
    // Find engineers
    const engineers = users.filter((user) => user.role === "engineer");

    const now = new Date();
    const assignments = [
      // E-commerce Platform Redesign (Active project)
      {
        engineerId: engineers.find((e) => e.name === "John Doe")._id,
        projectId: projects.find(
          (p) => p.name === "E-commerce Platform Redesign"
        )._id,
        allocationPercentage: 70,
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        role: "Tech Lead",
      },
      {
        engineerId: engineers.find((e) => e.name === "Jane Smith")._id,
        projectId: projects.find(
          (p) => p.name === "E-commerce Platform Redesign"
        )._id,
        allocationPercentage: 80,
        startDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        role: "Frontend Developer",
      },
      {
        engineerId: engineers.find((e) => e.name === "Mike Wilson")._id,
        projectId: projects.find(
          (p) => p.name === "E-commerce Platform Redesign"
        )._id,
        allocationPercentage: 60,
        startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
        role: "Backend Developer",
      },

      // Data Analytics Dashboard (Active project)
      {
        engineerId: engineers.find((e) => e.name === "Alex Brown")._id,
        projectId: projects.find((p) => p.name === "Data Analytics Dashboard")
          ._id,
        allocationPercentage: 90,
        startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        role: "Backend Developer",
      },
      {
        engineerId: engineers.find((e) => e.name === "Sarah Davis")._id,
        projectId: projects.find((p) => p.name === "Data Analytics Dashboard")
          ._id,
        allocationPercentage: 40,
        startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        role: "Frontend Developer",
      },

      // Mobile App Development (Upcoming project)
      {
        engineerId: engineers.find((e) => e.name === "Lisa Taylor")._id,
        projectId: projects.find((p) => p.name === "Mobile App Development")
          ._id,
        allocationPercentage: 100,
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        role: "Mobile Lead",
      },

      // API Microservices Migration (Upcoming project)
      {
        engineerId: engineers.find((e) => e.name === "Mike Wilson")._id,
        projectId: projects.find(
          (p) => p.name === "API Microservices Migration"
        )._id,
        allocationPercentage: 40,
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000),
        role: "Backend Developer",
      },

      // Legacy System Maintenance (Completed project)
      {
        engineerId: engineers.find((e) => e.name === "John Doe")._id,
        projectId: projects.find((p) => p.name === "Legacy System Maintenance")
          ._id,
        allocationPercentage: 30,
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        role: "Developer",
      },
    ];

    const createdAssignments = await Assignment.insertMany(assignments);
    console.log(`Created ${createdAssignments.length} assignments`);
    return createdAssignments;
  } catch (error) {
    console.error("Error seeding assignments:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Starting database seeding...");

    // Clear existing data
    await clearDatabase();

    // Seed users
    const users = await seedUsers();

    // Seed projects
    const projects = await seedProjects(users);

    // Seed assignments
    await seedAssignments(users, projects);

    console.log("Database seeding completed successfully!");
    console.log("\nTest Accounts:");
    console.log("Manager: manager1@company.com / password123");
    console.log("Manager: manager2@company.com / password123");
    console.log("Engineer: john.doe@company.com / password123");
    console.log("Engineer: jane.smith@company.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
