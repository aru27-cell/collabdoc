const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Document' },
  content: { type: Object, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['editor', 'viewer'], default: 'editor' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
