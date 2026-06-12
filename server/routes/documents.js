const router = require('express').Router();
const Document = require('../models/Document');
const Version = require('../models/Version');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const docAccess = require('../middleware/docAccess');

// ─── LIST ───────────────────────────────────────────────
// GET /api/docs — all docs owned + shared with user
router.get('/', auth, async (req, res) => {
  try {
    const owned = await Document
      .find({ owner: req.user.id })
      .populate('owner', 'name email color')
      .sort({ updatedAt: -1 });

    const shared = await Document
      .find({ 'collaborators.user': req.user.id })
      .populate('owner', 'name email color')
      .sort({ updatedAt: -1 });
res.json({ owned, shared });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── GET SINGLE ─────────────────────────────────────────
// GET /api/docs/:id — uses docAccess to check permission
router.get('/:id', auth, docAccess, async (req, res) => {
  res.json({
    ...req.doc.toObject(),
    userRole: req.userRole  // send role to frontend
  });
});

// ─── CREATE ─────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const doc = await Document.create({ owner: req.user.id });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// ─── SAVE CONTENT ───────────────────────────────────────
// PATCH /api/docs/:id — only editor or owner can save
router.patch('/:id', auth, docAccess, async (req, res) => {
  try {
    // Block viewers from saving
    if (req.userRole === 'viewer')
      return res.status(403).json({ message: 'Viewers cannot edit' });

    const { title, content } = req.body;
    const updated = await Document.findByIdAndUpdate(
      req.params.id,
      { title, content, lastEditedBy: req.user.id },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// ─── RENAME ─────────────────────────────────────────────
router.patch('/:id/rename', auth, docAccess, async (req, res) => {
  try {
    if (req.userRole === 'viewer')
      return res.status(403).json({ message: 'Viewers cannot rename' });
    const { title } = req.body;
    if (!title?.trim())
      return res.status(400).json({ message: 'Title cannot be empty' });
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { title: title.trim() },
      { new: true }
    );
    res.json(doc);
} catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── DELETE ─────────────────────────────────────────────
// Only owner can delete
router.delete('/:id', auth, docAccess, async (req, res) => {
  try {
    if (!req.isOwner)
      return res.status(403).json({ message: 'Only owner can delete' });
    await Document.findByIdAndDelete(req.params.id);
    await Version.deleteMany({ documentId: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// ─── SHARE ──────────────────────────────────────────────
// Only owner can share
router.post('/:id/share', auth, docAccess, async (req, res) => {
  try {
    if (!req.isOwner)
      return res.status(403).json({ message: 'Only owner can share' });

    const { email, role } = req.body;
    const targetUser = await User.findOne({ email });
    if (!targetUser)
      return res.status(404).json({ message: 'No user found with that email' });

    if (req.doc.owner._id.toString() === targetUser._id.toString())
      return res.status(400).json({ message: 'Cannot share with yourself' });

    const existing = req.doc.collaborators.find(
      c => c.user._id.toString() === targetUser._id.toString()
    );
    if (existing) {
      existing.role = role;
    } else {
      req.doc.collaborators.push({ user: targetUser._id, role });
    }
    await req.doc.save();
    res.json({ message: `Shared with ${targetUser.name} as ${role}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── REMOVE COLLABORATOR ────────────────────────────────
// Owner removes someone, or user removes themselves (leave)
router.delete('/:id/share/:userId', auth, docAccess, async (req, res) => {
  try {
    const isSelf = req.params.userId === req.user.id;
    if (!req.isOwner && !isSelf)
      return res.status(403).json({ message: 'Not allowed' });

    req.doc.collaborators = req.doc.collaborators.filter(
      c => c.user._id.toString() !== req.params.userId
    );
    await req.doc.save();
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── PUBLIC TOGGLE ──────────────────────────────────────
// Owner toggles public/private
router.patch('/:id/public', auth, docAccess, async (req, res) => {
  try {
    if (!req.isOwner)
      return res.status(403).json({ message: 'Only owner can change visibility' });
    req.doc.isPublic = !req.doc.isPublic;
    await req.doc.save();
    res.json({ isPublic: req.doc.isPublic });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── VERSIONS ───────────────────────────────────────────
router.post('/:id/versions', auth, docAccess, async (req, res) => {
  try {
    if (req.userRole === 'viewer')
      return res.status(403).json({ message: 'Viewers cannot save versions' });
    const version = await Version.create({
      documentId: req.params.id,
      content: req.doc.content,
      title: req.doc.title,
      savedBy: req.user.id
    });
    res.json(version);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/versions', auth, docAccess, async (req, res) => {
  try {
    const versions = await Version
      .find({ documentId: req.params.id })
      .populate('savedBy', 'name color')
      .sort({ createdAt: -1 });
    res.json(versions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
