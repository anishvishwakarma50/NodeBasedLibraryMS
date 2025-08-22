const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Book, Course } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         edition:
 *           type: string
 *         publisher:
 *           type: string
 *         publication_year:
 *           type: integer
 *         category:
 *           type: string
 *         course_id:
 *           type: integer
 *         total_copies:
 *           type: integer
 *         available_copies:
 *           type: integer
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with filtering and search
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or author
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *         description: Filter by course
 *       - in: query
 *         name: available_only
 *         schema:
 *           type: boolean
 *         description: Show only available books
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of books
 */
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('course_id').optional().isInt({ min: 1 }),
  query('available_only').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      search, 
      category, 
      course_id, 
      available_only, 
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { is_active: true };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Course filter
    if (course_id) {
      whereClause.course_id = course_id;
    }

    // Available only filter
    if (available_only === 'true') {
      whereClause.available_copies = { [Op.gt]: 0 };
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['title', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      books,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a specific book by ID
 *     tags: [Books]
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
 *         description: Book details
 *       404:
 *         description: Book not found
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, is_active: true },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book (Librarian only)
 *     tags: [Books]
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
 *               - category
 *               - total_copies
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               edition:
 *                 type: string
 *               publisher:
 *                 type: string
 *               publication_year:
 *                 type: integer
 *               category:
 *                 type: string
 *               course_id:
 *                 type: integer
 *               total_copies:
 *                 type: integer
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book added successfully
 */
router.post('/', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('title').isLength({ min: 2 }).trim(),
  body('author').isLength({ min: 2 }).trim(),
  body('category').isLength({ min: 2 }).trim(),
  body('total_copies').isInt({ min: 1 }),
  body('publication_year').optional().isInt({ min: 1000, max: new Date().getFullYear() }),
  body('course_id').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const bookData = req.body;
    bookData.available_copies = bookData.total_copies;

    // Check if course exists (if provided)
    if (bookData.course_id) {
      const course = await Course.findByPk(bookData.course_id);
      if (!course) {
        return res.status(400).json({ message: 'Invalid course selected' });
      }
    }

    const book = await Book.create(bookData);

    const bookWithCourse = await Book.findByPk(book.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(201).json({
      message: 'Book added successfully',
      book: bookWithCourse
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book (Librarian only)
 *     tags: [Books]
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
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 */
router.put('/:id', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('title').optional().isLength({ min: 2 }).trim(),
  body('author').optional().isLength({ min: 2 }).trim(),
  body('category').optional().isLength({ min: 2 }).trim(),
  body('total_copies').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const book = await Book.findOne({
      where: { id: req.params.id, is_active: true }
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updateData = req.body;

    // If total_copies is being updated, adjust available_copies accordingly
    if (updateData.total_copies && updateData.total_copies !== book.total_copies) {
      const issuedCopies = book.total_copies - book.available_copies;
      updateData.available_copies = Math.max(0, updateData.total_copies - issuedCopies);
    }

    await book.update(updateData);

    const updatedBook = await Book.findByPk(book.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book (Librarian only)
 *     tags: [Books]
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
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('librarian')
], async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, is_active: true }
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Soft delete
    await book.update({ is_active: false });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

