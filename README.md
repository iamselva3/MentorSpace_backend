# MentorSpace – Analytics-Based Learning Platform

MentorSpace is a full-stack MERN learning platform where teachers can create interactive educational content and track student engagement through powerful analytics dashboards.

The platform supports rich media articles, student reading analytics, highlighting features, and an AI learning assistant to enhance the educational experience.

Built with React, Node.js, Express, MongoDB, AWS S3, and Cohere AI.

 🚀 Features

👨‍🏫 Teacher Portal

🔐 Authentication
- Secure JWT-based authentication
- Role-based access control (Teacher / Student)
- Password hashing using bcrypt

 📝 Article Management
Teachers can:
- Create articles with rich content blocks
- Edit and delete articles
- Organize articles by category
- Upload media directly to AWS S3

 🧩 Content Blocks
Articles support multiple block types:
- Text
- Images
- Videos
- 3D Objects

This enables interactive learning content instead of simple text articles.

📊 Analytics Dashboard

Teachers can monitor student engagement using interactive charts powered by Chart.js.

Available analytics:

- 📊 Bar Chart – Articles vs Views
- 🥧 Pie Chart – Category distribution
- 📈 Line Chart – Daily engagement trends

Key metrics include:

- Total articles created
- Total student views
- Most popular categories
- Student reading behavior

### 📈 Student Progress Tracking
Teachers can track:
- Which students read which articles
- Time spent reading
- Article engagement statistics

---

 👨‍🎓 Student Portal

🔐 Secure Access
- Students log in using JWT authentication.

🔎 Article Discovery
Students can:
- Browse available articles
- Filter by category
- Search using keywords

📖 Rich Reading Experience
Articles support:
- Structured text
- Embedded images
- Videos
- Interactive content blocks

 📊 Engagement Tracking
The system automatically records:
- Article views
- Reading time
- User engagement

✏️ Highlight & Notes System
Students can:
- Highlight text inside articles
- Add personal notes
- Revisit highlights later

### 📊 Personal Dashboard
Each student has a dashboard showing:
- Reading statistics
- Category distribution
- Learning activity summary



## 🤖 AI Learning Assistant

MentorSpace includes an AI-powered assistant using Cohere AI.

Features:

- 💬 Always-available help button
- 📖 Context-aware responses based on the current page
- 🧠 Article summaries and study tips
- 🔄 Offline fallback responses when AI API is unavailable
- 📝 Session-based chat history
- 🪟 Minimize / maximize chat interface

This helps students get instant guidance while learning.

---

# 🛠 Technology Stack

## Frontend
- React.js – UI library
- React Router – Client-side routing
- Tailwind CSS – Styling and responsive design
- Chart.js – Analytics charts
- React Icons – Icon library
- Axios – API communication
- React Hot Toast – Notifications
- Date-fns – Date formatting utilities

 Backend
- Node.js – Runtime environment
- Express.js – Backend framework
- MongoDB – NoSQL database
- Mongoose – MongoDB ODM
- JWT – Authentication
- Bcrypt – Password hashing

 Media Storage
- AWS S3
- AWS SDK v3
- Multer
- Multer S3

Used for direct media uploads and scalable storage.

 AI Integration
- Cohere AI API

Used to power the AI learning assistant.
