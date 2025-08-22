const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Librarian } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/librarians:
 *   post:
 *     summary: Create a new librarian (Admin only)
 *     tags: [Librarians]
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
 *               - email
 *               - password
 *               - employee_id
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               employee_id:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [librarian, admin]
 *     responses:
 *       201:
 *         description: Librarian created successfully
 */
router.post('/', [
  authenticateToken,
  authorizeRoles('librarian'), // For now, any librarian can create another
  body('name').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('employee_id').isLength({ min: 3 }).trim(),
  body('role').optional().isIn(['librarian', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, employee_id, phone, address, role } = req.body;

    const existingLibrarian = await Librarian.findOne({
      where: {
        [Op.or]: [{ email }, { employee_id }]
      }
    });

    if (existingLibrarian) {
      return res.status(400).json({ 
        message: 'Librarian with this email or employee ID already exists' 
      });
    }

    const librarian = await Librarian.create({
      name,
      email,
      password,
      employee_id,
      phone,
      address,
      role: role || 'librarian'
    });

    const librarianResponse = librarian.toJSON();
    delete librarianResponse.password;

    res.status(201).json({
      message: 'Librarian created successfully',
      librarian: librarianResponse
    });
  } catch (error) {
    console.error('Create librarian error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/librarians/profile:
 *   get:
 *     summary: Get librarian profile
 *     tags: [Librarians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Librarian profile
 */
router.get('/profile', [
  authenticateToken,
  authorizeRoles('librarian')
], async (req, res) => {
  try {
    const librarian = await Librarian.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(librarian);
  } catch (error) {
    console.error('Get librarian profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/librarians/profile:
 *   put:
 *     summary: Update librarian profile
 *     tags: [Librarians]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', [
  authenticateToken,
  authorizeRoles('librarian'),
  body('name').optional().isLength({ min: 2 }).trim(),
  body('phone').optional().isLength({ min: 10, max: 15 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const librarian = await Librarian.findByPk(req.user.id);

    const allowedUpdates = ['name', 'phone', 'address'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await librarian.update(updateData);

    const updatedLibrarian = await Librarian.findByPk(librarian.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      librarian: updatedLibrarian
    });
  } catch (error) {
    console.error('Update librarian profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

