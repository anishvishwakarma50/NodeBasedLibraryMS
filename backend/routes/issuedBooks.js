const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { IssuedBook, Book, Student, Librarian, Fine } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const FineService = require('../services/fineService'); // Import the fine service

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
 *               return_date:
 *                 type: string
 *                 format: date
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
  body('return_date').optional().isISO8601().toDate(),
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

    const { return_date, notes } = req.body;
    
    const issuedBook = await IssuedBook.findByPk(req.params.id, {
      include: [
        {
          model: Book,
          as: 'book'
        },
        {
          model: Student,
          as: 'student'
        }
      ]
    });

    if (!issuedBook) {
      return res.status(404).json({ message: 'Issued book not found' });
    }

    if (issuedBook.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    const returnDate = return_date ? new Date(return_date) : new Date();
    const dueDate = new Date(issuedBook.due_date);

    // Calculate fine if book is returned after due date
    let fineAmount = 0;
    if (returnDate > dueDate) {
      const fineData = await FineService.calculateFine(issuedBook.id);
      if (fineData) {
        // Create or update fine record
        const existingFine = await Fine.findOne({
          where: { issued_book_id: issuedBook.id }
        });

        if (existingFine) {
          await existingFine.update({
            amount: fineData.amount,
            days_overdue: fineData.days_overdue,
            status: 'pending'
          });
          fineAmount = fineData.amount;
        } else {
          const fine = await Fine.create(fineData);
          fineAmount = fineData.amount;
        }
      }
    }

    // Update issued book record
    await issuedBook.update({
      return_date: returnDate,
      status: 'returned',
      fine_amount: fineAmount,
      notes: notes || issuedBook.notes
    });

    // Update book available copies
    await Book.increment('available_copies', {
      where: { id: issuedBook.book_id }
    });

    const updatedIssuedBook = await IssuedBook.findByPk(issuedBook.id, {
      include: [
        { 
          association: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        },
        { 
          association: 'student',
          attributes: ['id', 'name', 'email', 'student_id']
        },
        { 
          association: 'librarian',
          attributes: ['id', 'name', 'employee_id']
        }
      ]
    });

    res.json({
      message: 'Book returned successfully',
      issuedBook: updatedIssuedBook,
      fineAmount: fineAmount
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
        },
        {
          model: Fine,
          as: 'fines',
          where: { status: 'pending' },
          required: false
        }
      ],
      order: [['due_date', 'ASC']]
    });

    // Calculate total fines for each overdue book
    const overdueBooksWithFines = overdueBooks.map(book => {
      const totalFine = book.fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
      return {
        ...book.toJSON(),
        total_fine: totalFine
      };
    });

    res.json(overdueBooksWithFines);
  } catch (error) {
    console.error('Get overdue books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/issued-books/{id}/fines:
 *   get:
 *     summary: Get fines for a specific issued book
 *     tags: [Issued Books]
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
 *         description: List of fines for the issued book
 *       404:
 *         description: Issued book not found
 */
router.get('/:id/fines', [
  authenticateToken
], async (req, res) => {
  try {
    const issuedBook = await IssuedBook.findByPk(req.params.id, {
      include: [
        {
          model: Fine,
          as: 'fines'
        }
      ]
    });

    if (!issuedBook) {
      return res.status(404).json({ message: 'Issued book not found' });
    }

    // Students can only see their own fines
    if (req.userRole === 'student' && issuedBook.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      issuedBook: {
        id: issuedBook.id,
        book_id: issuedBook.book_id,
        student_id: issuedBook.student_id,
        issue_date: issuedBook.issue_date,
        due_date: issuedBook.due_date,
        return_date: issuedBook.return_date,
        status: issuedBook.status
      },
      fines: issuedBook.fines
    });
  } catch (error) {
    console.error('Get issued book fines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/issued-books/student/{studentId}/fines:
 *   get:
 *     summary: Get all fines for a student
 *     tags: [Issued Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, waived]
 *     responses:
 *       200:
 *         description: List of student fines
 *       403:
 *         description: Access denied
 */
router.get('/student/:studentId/fines', [
  authenticateToken,
  query('status').optional().isIn(['pending', 'paid', 'waived'])
], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    // Students can only see their own fines
    if (req.userRole === 'student' && parseInt(studentId) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const whereClause = { student_id: studentId };
    if (status) {
      whereClause.status = status;
    }

    const fines = await Fine.findAll({
      where: whereClause,
      include: [
        {
          association: 'issuedBook',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'author']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ fines });
  } catch (error) {
    console.error('Get student fines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;