const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({

  // Which document this version belongs to
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },

  // Full content snapshot at this point in time
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
// Title of the document at this point
  title: {
    type: String,
    default: 'Untitled Document'
  },

  // Which user triggered this save
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Human readable label — optional, user can name a version
  label: {
    type: String,
    default: '' // example: "Before major rewrite"
  }

}, { timestamps: true });

module.exports = mongoose.model('Version', VersionSchema);
