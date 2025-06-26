# Engineering Resource Management System

A full-stack application to manage engineers, projects, and assignments.  
Built with **Node.js**, **Express**, **MongoDB**, and **React** .

---

## Features

- **Authentication** (Manager & Engineer roles)
- **Manager Dashboard**: View/manage engineers, projects, assignments (create/edit)
- **Engineer Dashboard**: View own assignments and profile
- **Capacity Tracking**: Visual progress bars for workload
- **Skill Tags**: Displayed for each engineer
- **Responsive UI**: Mobile-friendly with Tailwind CSS
- **Error Handling**: User-friendly error and loading messages

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd engineering-resource-system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### **Environment Variables**

Create a `.env` file in the `backend` folder:

```
MONGO_URI=mongodb://localhost:27017/engineering-resource-system
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

#### **Seed the Database**

You can use the provided `seed.js` script to add sample users, projects, and assignments.

```bash
node seed.js
```

#### **Start the Backend**

```bash
npm start
```

The backend will run on [http://localhost:5000](http://localhost:5000)

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## Usage

- **Login** as a manager or engineer (see seed users below).
- **Manager**: Manage team, projects, assignments.
- **Engineer**: View your assignments and profile.
- **Responsive**: Works on desktop and mobile.

---

## Sample Seed Users

| Role     | Email                 | Password |
| -------- | --------------------- | -------- |
| Manager  | manager1@company.com  | password |
| Engineer | engineer1@company.com | password |
| Engineer | engineer2@company.com | password |

---

## Database Seed Script

Create a file called `seed.js` in your `backend` folder:

```javascript
// filepath: backend/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Project = require("./models/Project");
const Assignment = require("./models/Assignment");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/engineering-resource-system";

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});
  await Assignment.deleteMany({});

  // Create users
  const manager = await User.create({
    name: "Alice Johnson",
    email: "manager1@company.com",
    password: await bcrypt.hash("password", 10),
    role: "manager",
    department: "Engineering",
    skills: ["Manager"],
    maxCapacity: 100,
    seniority: "senior",
  });

  const engineer1 = await User.create({
    name: "Jane Smith",
    email: "engineer1@company.com",
    password: await bcrypt.hash("password", 10),
    role: "engineer",
    department: "Engineering",
    skills: ["React", "TypeScript", "CSS", "HTML"],
    maxCapacity: 100,
    seniority: "mid",
  });

  const engineer2 = await User.create({
    name: "Mike Wilson",
    email: "engineer2@company.com",
    password: await bcrypt.hash("password", 10),
    role: "engineer",
    department: "Engineering",
    skills: ["Node.js", "Python", "MongoDB", "PostgreSQL"],
    maxCapacity: 100,
    seniority: "senior",
  });

  // Create a project
  const project = await Project.create({
    name: "Mobile App Development",
    description: "Build a cross-platform mobile app.",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requiredSkills: ["React Native", "JavaScript", "iOS", "Android"],
    teamSize: 3,
    status: "active",
  });

  // Assign engineer1 to the project
  await Assignment.create({
    engineerId: engineer1._id,
    projectId: project._id,
    role: "Frontend Developer",
    allocationPercentage: 80,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  console.log("Database seeded!");
  process.exit();
}

seed();
```

**Run the seed script:**

```bash
node seed.js
```

---

## Screenshots

_Add screenshots of the Manager and Engineer dashboards here if required._

---

## Notes

- No TypeScript, only JavaScript and React.
- For any issues, check your `.env` and MongoDB connection.

---

## License

MIT
