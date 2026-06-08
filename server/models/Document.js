const mongoose = require('mongoose');

// Schema for each collaborator inside a document
const CollaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // links to User model
  },
  role: {
    type: String,
    enum: ['editor', 'viewer'], // only these two values allowed
    default: 'editor'
  }
}, { _id: false }); 

const DocumentSchema = new mongoose.Schema({

  // Document title — user can change this
  title: {
    type: String,
    default: 'Untitled Document',
    trim: true
  },

content: {
    type: mongoose.Schema.Types.Mixed, // can be any shape
    default: { ops: [{ insert: '\n' }] } // empty Quill document
  },

  // Who created the document
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // People the owner shared the doc with
  collaborators: [CollaboratorSchema],

  // If true — anyone with the link can view (like Google Docs share)
  isPublic: {
    type: Boolean,
    default: false
  },

 // Last time someone edited — updated on every save
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
