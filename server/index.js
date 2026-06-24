
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST','PATCH','DELETE'] }
});

app.use(cors());
app.use(express.json());

require('./models/User');
require('./models/Document');
require('./models/Version');
require('./models/Comment');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/docs', require('./routes/documents'));
app.use('/api/comments', require('./routes/comments'));

app.get('/', (req, res) => res.send('CollabDoc running!'));

// activeRooms[docId] = [{ socketId, userId, name, color }]
const activeRooms = {};

function logRoom(docId) {
  console.log(`📊 Room ${docId}:`, (activeRooms[docId] || []).map(u => u.name));
}

io.on('connection', (socket) => {
  console.log('🔌 connected:', socket.id);

  socket.on('join-document', (payload) => {
    console.log('📥 join-document RECEIVED:', payload);

    const { docId, user } = payload || {};
    if (!docId || !user) {
      console.log('❌ Bad payload — missing docId or user');
      return;
    }

    socket.join(docId);
    socket.currentDoc = docId;

    if (!activeRooms[docId]) activeRooms[docId] = [];

    // remove old entry for this socket
    activeRooms[docId] = activeRooms[docId].filter(u => u.socketId !== socket.id);

    activeRooms[docId].push({
      socketId: socket.id,
      userId: user.id || user._id || 'unknown',
      name: user.name || 'User',
      color: user.color || '#3B82F6'
    });

    logRoom(docId);

    // send to EVERYONE in room — io.to NOT socket.broadcast
    io.to(docId).emit('active-users', activeRooms[docId]);
    console.log(`✅ Emitted active-users (${activeRooms[docId].length}) to room ${docId}`);
  });

  socket.on('content-change', ({ docId, html }) => {
    if (!docId) return;
    socket.broadcast.to(docId).emit('content-update', html);
  });

  socket.on('title-change', ({ docId, title }) => {
    if (!docId) return;
    socket.broadcast.to(docId).emit('title-update', title);
  });

  socket.on('disconnect', () => {
    const docId = socket.currentDoc;
    console.log('❌ disconnected:', socket.id, 'from', docId);
    if (docId && activeRooms[docId]) {
      activeRooms[docId] = activeRooms[docId].filter(u => u.socketId !== socket.id);
      if (activeRooms[docId].length === 0) {
        delete activeRooms[docId];
      } else {
        io.to(docId).emit('active-users', activeRooms[docId]);
      }
      logRoom(docId);
    }
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

