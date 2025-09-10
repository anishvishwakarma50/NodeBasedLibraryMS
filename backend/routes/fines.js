const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Fine, IssuedBook, Student } = require('../models');
const FineService = require('../services/fineService');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Fine:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         issued_book_id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         amount:
 *           type: number
 *         days_overdue:
 *           type: integer
 *         fine_rate_per_day:
 *           type: number
 *         status:
 *           type: string
 *         paid_date:
 *           type: string
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/fines:
 *   get:
 *     summary: Get fines with filtering
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (pending, paid, waived)
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
 *         description: List of fines
 */
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('student_id').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['pending', 'paid', 'waived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { student_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (student_id) whereClause.student_id = student_id;
    if (status) whereClause.status = status;

    const { count, rows: fines } = await Fine.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'issuedBook',
          include: ['book']
        },
        {
          association: 'student',
          attributes: ['id', 'name', 'student_id', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      fines,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fines/generate:
 *   post:
 *     summary: Generate fines for all overdue books (Librarian only)
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fines generated successfully
 */
router.post('/generate', [
  authenticateToken,
  authorizeRoles('librarian')
], async (req, res) => {
  try {
    const results = await FineService.generateFinesForOverdueBooks();
    
    res.json({
      message: 'Fines generated successfully',
      results: results
    });
  } catch (error) {
    console.error('Generate fines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fines/{id}/pay:
 *   post:
 *     summary: Mark fine as paid (Librarian only)
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paid_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Fine marked as paid
 */
router.post('/:id/pay', [
  authenticateToken,
  authorizeRoles('librarian')
], async (req, res) => {
  try {
    const { paid_date } = req.body;
    
    const fine = await FineService.payFine(req.params.id, paid_date);
    
    res.json({
      message: 'Fine marked as paid successfully',
      fine: fine
    });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/fines/{id}/waive:
 *   post:
 *     summary: Waive fine (Librarian only)
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fine waived successfully
 */
router.post('/:id/waive', [
  authenticateToken,
  authorizeRoles('librarian')
], async (req, res) => {
  try {
    const { notes } = req.body;
    
    const fine = await FineService.waiveFine(req.params.id, notes);
    
    res.json({
      message: 'Fine waived successfully',
      fine: fine
    });
  } catch (error) {
    console.error('Waive fine error:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/fines/student/{studentId}:
 *   get:
 *     summary: Get fines for a specific student
 *     tags: [Fines]
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
 *         description: Filter by status (pending, paid, waived)
 *     responses:
 *       200:
 *         description: Student fines
 */
router.get('/student/:studentId', [
  authenticateToken
], async (req, res) => {
  try {
    const { status } = req.query;
    
    const fines = await FineService.getStudentFines(req.params.studentId, status);
    
    res.json({ fines });
  } catch (error) {
    console.error('Get student fines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;