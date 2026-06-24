const router = require('express').Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/authMiddleware');

// GET all comments for a document
router.get('/:docId', auth, async (req, res) => {
  try {
    const comments = await Comment
      .find({ documentId: req.params.docId })
      .populate('author', 'name email color')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST — add a new comment
router.post('/:docId', auth, async (req, res) => {
  try {
    const { text, selectedText } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: 'Comment text required' });
    const comment = await Comment.create({
      documentId: req.params.docId,
      author: req.user.id,
      text: text.trim(),
      selectedText: selectedText || ''
    });
    const populated = await comment.populate('author', 'name email color');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// PATCH — resolve a comment
router.patch('/:commentId/resolve', auth, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { resolved: true },
      { new: true }
    ).populate('author', 'name email color');
    res.json(comment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE — delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
