const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  selectedText: {
    type: String,
    default: ''  // the text that was highlighted when comment was added
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
