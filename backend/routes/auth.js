const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Student, Librarian, Course } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, librarian]
 *     RegisterStudentRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - student_id
 *         - course_id
 *         - semester
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         student_id:
 *           type: string
 *         course_id:
 *           type: integer
 *         semester:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user (student or librarian)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'librarian'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, role } = req.body;
    let user;

    if (role === 'student') {
      user = await Student.findOne({ 
        where: { email },
        include: [{ model: Course, as: 'course' }]
      });
    } else {
      user = await Librarian.findOne({ where: { email } });
    }

    if (!user || !user.is_active) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @swagger
 * /api/auth/register/student:
 *   post:
 *     summary: Register a new student
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterStudentRequest'
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Validation error or student already exists
 *       500:
 *         description: Server error
 */
router.post('/register/student', [
  body('name').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('student_id').isLength({ min: 3 }).trim(),
  body('course_id').isInt({ min: 1 }),
  body('semester').isLength({ min: 1 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, student_id, course_id, semester, phone, address, date_of_birth } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      where: {
        [Op.or]: [{ email }, { student_id }]
      }
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or student ID already exists' 
      });
    }

    // Check if course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(400).json({ message: 'Invalid course selected' });
    }

    const student = await Student.create({
      name,
      email,
      password,
      student_id,
      course_id,
      semester,
      phone,
      address,
      date_of_birth
    });

    const token = jwt.sign(
      { id: student.id, role: 'student', email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const studentResponse = student.toJSON();
    delete studentResponse.password;

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: studentResponse
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
      role: req.userRole
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

