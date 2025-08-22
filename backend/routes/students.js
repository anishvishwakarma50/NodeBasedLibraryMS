const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Student, Course, IssuedBook, Book } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students (Librarian only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *         description: Filter by course
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/', [
  authenticateToken,
  authorizeRoles('librarian'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('course_id').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { search, course_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = { is_active: true };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { student_id: { [Op.like]: `%${search}%` } }
      ];
    }

    if (course_id) {
      whereClause.course_id = course_id;
    }

    const { count, rows: students } = await Student.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IssuedBook,
          as: 'issuedBooks',
          where: { status: 'issued' },
          required: false,
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title']
            }
          ]
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      students,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student details
 *     tags: [Students]
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
 *         description: Student details
 *       404:
 *         description: Student not found
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Students can only access their own profile, librarians can access any
    if (req.userRole === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findOne({
      where: { id: studentId, is_active: true },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IssuedBook,
          as: 'issuedBooks',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'author']
            }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student profile
 *     tags: [Students]
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
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               semester:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 */
router.put('/:id', [
  authenticateToken,
  body('name').optional().isLength({ min: 2 }).trim(),
  body('phone').optional().isLength({ min: 10, max: 15 }).trim(),
  body('semester').optional().isLength({ min: 1 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const studentId = req.params.id;
    
    // Students can only update their own profile, librarians can update any
    if (req.userRole === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findOne({
      where: { id: studentId, is_active: true }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const allowedUpdates = ['name', 'phone', 'address', 'semester'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await student.update(updateData);

    const updatedStudent = await Student.findByPk(student.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      message: 'Profile updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/students/{id}/borrowing-history:
 *   get:
 *     summary: Get student's borrowing history
 *     tags: [Students]
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
 *         description: Borrowing history
 */
router.get('/:id/borrowing-history', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Students can only access their own history, librarians can access any
    if (req.userRole === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const history = await IssuedBook.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'isbn']
        }
      ],
      order: [['issue_date', 'DESC']]
    });

    res.json(history);
  } catch (error) {
    console.error('Get borrowing history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

