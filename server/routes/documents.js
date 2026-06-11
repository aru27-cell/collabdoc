const router = require('express').Router();
const Document = require('../models/Document');
const auth = require('../middleware/authMiddleware');

// GET all docs for logged in user
router.get('/', auth, async (req, res) => {
  const docs = await Document.find({ owner: req.user.id });
  res.json(docs);
});

// CREATE new document
router.post('/', auth, async (req, res) => {
  const doc = await Document.create({ owner: req.user.id });
  res.json(doc);
});

// DELETE a document
router.delete('/:id', auth, async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});


// SHARE — add a collaborator by email
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { email, role } = req.body;

    // Find user by email
    const targetUser = await User.findOne({ email });
    if (!targetUser)
      return res.status(404).json({ message: 'No user found with that email' });

    const doc = await Document.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ message: 'Document not found' });

    // Check if owner trying to share with themselves
    if (doc.owner.toString() === targetUser._id.toString())
      return res.status(400).json({ message: 'Cannot share with yourself' });
    // Check if already a collaborator — update role
    const existing = doc.collaborators.find(
      c => c.user.toString() === targetUser._id.toString()
    );
    if (existing) {
      existing.role = role;
    } else {
      doc.collaborators.push({ user: targetUser._id, role });
    }

    await doc.save();
    res.json({ message: `Shared with ${targetUser.name} as ${role}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// RENAME — update document title only
router.patch('/:id/rename', auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim())
      return res.status(400).json({ message: 'Title cannot be empty' });
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { title: title.trim() },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
