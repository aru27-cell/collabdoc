const mongoose = require('mongoose');

// Colors for live cursors — each user gets one automatically
const CURSOR_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F5',
  '#FF8C00', '#00CED1', '#9400D3', '#FF1493'
];

const UserSchema = new mongoose.Schema({

  // Basic info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true // removes extra spaces
  },
email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // no two users same email
    lowercase: true, // saves as lowercase always
    trim: true
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6 // minimum 6 characters
  },

  // Profile picture URL (optional)
  avatar: {
    type: String,
    default: ''
  },
   // Color for live cursor in editor
  color: {
    type: String,
    default: () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]
  }

}, { timestamps: true }); // auto adds createdAt and updatedAt

module.exports = mongoose.model('User', UserSchema);

