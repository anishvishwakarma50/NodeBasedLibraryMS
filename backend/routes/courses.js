const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Course } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         duration_years:
 *           type: integer
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all active courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Librarian only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               duration_years:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post('/', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('name').isLength({ min: 2 }).trim(),
  body('code').isLength({ min: 2 }).trim(),
  body('duration_years').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, code, description, duration_years } = req.body;

    const existingCourse = await Course.findOne({
      where: {
        [Op.or]: [{ name }, { code }]
      }
    });

    if (existingCourse) {
      return res.status(400).json({ 
        message: 'Course with this name or code already exists' 
      });
    }

    const course = await Course.create({
      name,
      code,
      description,
      duration_years: duration_years || 2
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

