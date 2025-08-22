const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { IssuedBook, Book, Student, Librarian } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/issued-books:
 *   get:
 *     summary: Get all issued books
 *     tags: [Issued Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [issued, returned, overdue, lost]
 *         description: Filter by status
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student
 *       - in: query
 *         name: overdue_only
 *         schema:
 *           type: boolean
 *         description: Show only overdue books
 *     responses:
 *       200:
 *         description: List of issued books
 */
router.get('/', [
  authenticateToken,
  query('student_id').optional().isInt({ min: 1 }),
  query('overdue_only').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, student_id, overdue_only } = req.query;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (student_id) {
      // Students can only see their own issued books
      if (req.userRole === 'student' && req.user.id !== parseInt(student_id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      whereClause.student_id = student_id;
    } else if (req.userRole === 'student') {
      // If no student_id specified and user is student, show only their books
      whereClause.student_id = req.user.id;
    }

    if (overdue_only === 'true') {
      whereClause.due_date = { [Op.lt]: new Date() };
      whereClause.status = 'issued';
    }

    const issuedBooks = await IssuedBook.findAll({
      where: whereClause,
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        },
        {
          model: Librarian,
          as: 'librarian',
          attributes: ['id', 'name', 'employee_id']
        }
      ],
      order: [['issue_date', 'DESC']]
    });

    res.json(issuedBooks);
  } catch (error) {
    console.error('Get issued books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/issued-books/issue:
 *   post:
 *     summary: Issue a book to a student (Librarian only)
 *     tags: [Issued Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - book_id
 *               - due_date
 *             properties:
 *               student_id:
 *                 type: integer
 *               book_id:
 *                 type: integer
 *               due_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book issued successfully
 *       400:
 *         description: Book not available or student limit exceeded
 */
router.post('/issue', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('student_id').isInt({ min: 1 }),
  body('book_id').isInt({ min: 1 }),
  body('due_date').isISO8601().toDate(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { student_id, book_id, due_date, notes } = req.body;

    // Check if student exists and is active
    const student = await Student.findOne({
      where: { id: student_id, is_active: true }
    });

    if (!student) {
      return res.status(400).json({ message: 'Student not found or inactive' });
    }

    // Check if book exists and is available
    const book = await Book.findOne({
      where: { id: book_id, is_active: true }
    });

    if (!book) {
      return res.status(400).json({ message: 'Book not found or inactive' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // Check if student has already issued this book
    const existingIssue = await IssuedBook.findOne({
      where: {
        student_id,
        book_id,
        status: 'issued'
      }
    });

    if (existingIssue) {
      return res.status(400).json({ message: 'Student has already issued this book' });
    }

    // Check student's current issued books count
    const currentIssued = await IssuedBook.count({
      where: {
        student_id,
        status: 'issued'
      }
    });

    if (currentIssued >= student.max_books_allowed) {
      return res.status(400).json({ 
        message: `Student has reached maximum limit of ${student.max_books_allowed} books` 
      });
    }

    // Issue the book
    const issuedBook = await IssuedBook.create({
      student_id,
      book_id,
      librarian_id: req.user.id,
      due_date,
      notes
    });

    // Update book's available copies
    await book.update({
      available_copies: book.available_copies - 1
    });

    const issuedBookWithDetails = await IssuedBook.findByPk(issuedBook.id, {
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        },
        {
          model: Librarian,
          as: 'librarian',
          attributes: ['id', 'name', 'employee_id']
        }
      ]
    });

    res.status(201).json({
      message: 'Book issued successfully',
      issuedBook: issuedBookWithDetails
    });
  } catch (error) {
    console.error('Issue book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/issued-books/{id}/return:
 *   put:
 *     summary: Return a book (Librarian only)
 *     tags: [Issued Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fine_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       404:
 *         description: Issued book not found
 */
router.put('/:id/return', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('fine_amount').optional().isFloat({ min: 0 }),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const issuedBook = await IssuedBook.findOne({
      where: { 
        id: req.params.id, 
        status: 'issued' 
      },
      include: [
        {
          model: Book,
          as: 'book'
        }
      ]
    });

    if (!issuedBook) {
      return res.status(404).json({ message: 'Issued book not found or already returned' });
    }

    const { fine_amount = 0, notes } = req.body;
    const returnDate = new Date();

    // Calculate fine if overdue and no fine amount provided
    let calculatedFine = fine_amount;
    if (fine_amount === 0 && returnDate > issuedBook.due_date) {
      const overdueDays = Math.ceil((returnDate - issuedBook.due_date) / (1000 * 60 * 60 * 24));
      calculatedFine = overdueDays * 2; // $2 per day fine
    }

    // Update issued book record
    await issuedBook.update({
      return_date: returnDate,
      status: 'returned',
      fine_amount: calculatedFine,
      notes: notes || issuedBook.notes
    });

    // Update book's available copies
    await issuedBook.book.update({
      available_copies: issuedBook.book.available_copies + 1
    });

    const returnedBookWithDetails = await IssuedBook.findByPk(issuedBook.id, {
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        },
        {
          model: Librarian,
          as: 'librarian',
          attributes: ['id', 'name', 'employee_id']
        }
      ]
    });

    res.json({
      message: 'Book returned successfully',
      issuedBook: returnedBookWithDetails,
      fine_amount: calculatedFine
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/issued-books/overdue:
 *   get:
 *     summary: Get all overdue books (Librarian only)
 *     tags: [Issued Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue books
 */
router.get('/overdue', [
  authenticateToken,
  authorizeRoles('librarian')
], async (req, res) => {
  try {
    const overdueBooks = await IssuedBook.findAll({
      where: {
        status: 'issued',
        due_date: { [Op.lt]: new Date() }
      },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'student_id', 'phone']
        }
      ],
      order: [['due_date', 'ASC']]
    });

    res.json(overdueBooks);
  } catch (error) {
    console.error('Get overdue books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

