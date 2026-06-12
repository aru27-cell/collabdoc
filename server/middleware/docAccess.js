const Document = require('../models/Document');

// Attach doc to req + check access
const docAccess = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('owner', 'name email color')
      .populate('collaborators.user', 'name email color');

    if (!doc)
      return res.status(404).json({ message: 'Document not found' });

    const userId = req.user.id;
    const isOwner = doc.owner._id.toString() === userId;

    // Find collaborator entry for this user
    const collaborator = doc.collaborators.find(
      c => c.user._id.toString() === userId
    );
    // Block if no access at all
    if (!isOwner && !collaborator && !doc.isPublic)
      return res.status(403).json({ message: 'Access denied' });

    // Attach useful info to req for use in routes
    req.doc = doc;
    req.isOwner = isOwner;
    req.userRole = isOwner
      ? 'owner'
      : collaborator
      ? collaborator.role
      : 'viewer'; // public viewer

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = docAccess;
