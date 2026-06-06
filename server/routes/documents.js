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

module.exports = router;
