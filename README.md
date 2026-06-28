# CollabDoc — Real-Time Collaborative Document Editor

A Google Docs clone built from scratch with React, Node.js, MongoDB, and Socket.io. Multiple users can edit the same document simultaneously and see each other's changes live.

🔗 **Live Demo:** https://collabdoc-two.vercel.app
🔗 **GitHub:** https://github.com/aru27-cell/collabdoc

## ✨ Features

- 🔐 JWT authentication with bcrypt password hashing
- 📝 Rich text editor (Quill.js) with formatting toolbar
- ⚡ Real-time collaborative editing via Socket.io (WebSockets)
- 👥 Live "who's online" presence indicators
- 🔗 Document sharing with editor/viewer role permissions
- 🕐 Version history with restore functionality
- 💬 Comments system with resolve/delete
- 🔍 Find & Replace inside documents
- 📄 Export documents as PDF
- 🌙 Dark mode toggle
- 📱 Fully responsive design

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Quill.js, Socket.io-client, Axios
**Backend:** Node.js, Express, Socket.io, JWT, bcrypt
**Database:** MongoDB with Mongoose
**Deployment:** Vercel (frontend), Render (backend)

## 🏗️ Architecture

```
Client (React) ←→ REST API (Express) ←→ MongoDB
       ↕
   WebSocket (Socket.io) — real-time sync
```

## 🚀 Running Locally

```bash
# Backend
cd server
npm install
node index.js

# Frontend
cd client
npm install
npm run dev
```

Add a `.env` file in `server/` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

## 🎯 What I Learned

Building this project taught me how real-time collaborative systems work under the hood — specifically how to handle concurrent edits without conflicts using Socket.io rooms, how to design a permission system with role-based access control, and how to structure a fullstack app for both correctness and a smooth user experience.


## 📄 License

MIT
