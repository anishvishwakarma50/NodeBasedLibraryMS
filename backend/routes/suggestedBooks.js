const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { SuggestedBook, Student, Librarian } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/suggested-books:
 *   get:
 *     summary: Get suggested books
 *     tags: [Suggested Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student (librarian only)
 *     responses:
 *       200:
 *         description: List of suggested books
 */
router.get('/', [
  authenticateToken,
  query('student_id').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, student_id } = req.query;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (student_id) {
      // Students can only see their own suggestions
      if (req.userRole === 'student' && req.user.id !== parseInt(student_id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      whereClause.student_id = student_id;
    } else if (req.userRole === 'student') {
      // If no student_id specified and user is student, show only their suggestions
      whereClause.student_id = req.user.id;
    }

    const suggestions = await SuggestedBook.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        },
        {
          model: Librarian,
          as: 'reviewer',
          attributes: ['id', 'name', 'employee_id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Get suggested books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/suggested-books:
 *   post:
 *     summary: Suggest a new book (Student only)
 *     tags: [Suggested Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - reason
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publisher:
 *                 type: string
 *               category:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book suggestion submitted successfully
 */
router.post('/', [
  authenticateToken,
  authorizeRoles('student'),
  body('title').isLength({ min: 2 }).trim(),
  body('author').isLength({ min: 2 }).trim(),
  body('reason').isLength({ min: 10 }).trim(),
  body('isbn').optional().trim(),
  body('publisher').optional().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, author, isbn, publisher, category, reason } = req.body;

    const suggestion = await SuggestedBook.create({
      student_id: req.user.id,
      title,
      author,
      isbn,
      publisher,
      category,
      reason
    });

    const suggestionWithDetails = await SuggestedBook.findByPk(suggestion.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        }
      ]
    });

    res.status(201).json({
      message: 'Book suggestion submitted successfully',
      suggestion: suggestionWithDetails
    });
  } catch (error) {
    console.error('Create suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/suggested-books/{id}/review:
 *   put:
 *     summary: Review a book suggestion (Librarian only)
 *     tags: [Suggested Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               review_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suggestion reviewed successfully
 *       404:
 *         description: Suggestion not found
 */
router.put('/:id/review', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('status').isIn(['approved', 'rejected']),
  body('review_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const suggestion = await SuggestedBook.findOne({
      where: { 
        id: req.params.id,
        status: 'pending'
      }
    });

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found or already reviewed' });
    }

    const { status, review_notes } = req.body;

    await suggestion.update({
      status,
      reviewed_by: req.user.id,
      review_date: new Date(),
      review_notes
    });

    const reviewedSuggestion = await SuggestedBook.findByPk(suggestion.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        },
        {
          model: Librarian,
          as: 'reviewer',
          attributes: ['id', 'name', 'employee_id']
        }
      ]
    });

    res.json({
      message: `Suggestion ${status} successfully`,
      suggestion: reviewedSuggestion
    });
  } catch (error) {
    console.error('Review suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/suggested-books/{id}:
 *   delete:
 *     summary: Delete a book suggestion
 *     tags: [Suggested Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Suggestion deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Suggestion not found
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const suggestion = await SuggestedBook.findByPk(req.params.id);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Students can only delete their own suggestions, librarians can delete any
    if (req.userRole === 'student' && suggestion.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await suggestion.destroy();

    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Delete suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

