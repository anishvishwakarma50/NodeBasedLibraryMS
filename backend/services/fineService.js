const { IssuedBook, Fine, FineConfig } = require('../models');
const { Op } = require('sequelize');

class FineService {
  // Calculate fine for an issued book
  static async calculateFine(issuedBookId) {
    const issuedBook = await IssuedBook.findByPk(issuedBookId, {
      include: ['book', 'student']
    });

    if (!issuedBook || issuedBook.status === 'returned') {
      return null;
    }

    const today = new Date();
    const dueDate = new Date(issuedBook.due_date);
    
    if (today <= dueDate) {
      return null; // Not overdue yet
    }

    // Get fine configuration
    const fineConfig = await FineConfig.findOne({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    });

    const fineRate = fineConfig ? fineConfig.fine_rate_per_day : 5.00;
    const gracePeriod = fineConfig ? fineConfig.grace_period_days : 0;

    // Calculate days overdue (excluding grace period)
    const timeDiff = today.getTime() - dueDate.getTime();
    let daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24)) - gracePeriod;
    daysOverdue = Math.max(0, daysOverdue); // Ensure not negative

    if (daysOverdue === 0) {
      return null; // Within grace period
    }

    // Calculate fine amount
    let fineAmount = daysOverdue * fineRate;
    
    // Apply max fine limit if configured
    if (fineConfig && fineConfig.max_fine_amount && fineAmount > fineConfig.max_fine_amount) {
      fineAmount = fineConfig.max_fine_amount;
    }

    return {
      issued_book_id: issuedBookId,
      student_id: issuedBook.student_id,
      amount: fineAmount,
      days_overdue: daysOverdue,
      fine_rate_per_day: fineRate
    };
  }

  // Generate fines for all overdue books
  static async generateFinesForOverdueBooks() {
    const overdueBooks = await IssuedBook.findAll({
      where: {
        status: 'issued',
        due_date: {
          [Op.lt]: new Date()
        }
      }
    });

    const results = [];
    
    for (const book of overdueBooks) {
      const fineData = await this.calculateFine(book.id);
      
      if (fineData) {
        // Check if fine already exists
        const existingFine = await Fine.findOne({
          where: {
            issued_book_id: book.id,
            status: 'pending'
          }
        });

        if (existingFine) {
          // Update existing fine
          await existingFine.update(fineData);
          results.push({ issued_book_id: book.id, action: 'updated', fine: existingFine });
        } else {
          // Create new fine
          const fine = await Fine.create(fineData);
          results.push({ issued_book_id: book.id, action: 'created', fine });
        }

        // Update issued book status to overdue
        await book.update({ status: 'overdue' });
      }
    }

    return results;
  }

  // Get fines for a student
  static async getStudentFines(studentId, status = 'pending') {
    return await Fine.findAll({
      where: {
        student_id: studentId,
        status: status
      },
      include: [
        {
          association: 'issuedBook',
          include: ['book']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // Mark fine as paid
  static async payFine(fineId, paidDate = new Date()) {
    const fine = await Fine.findByPk(fineId);
    
    if (!fine) {
      throw new Error('Fine not found');
    }

    if (fine.status === 'paid') {
      throw new Error('Fine already paid');
    }

    return await fine.update({
      status: 'paid',
      paid_date: paidDate
    });
  }

  // Waive fine
  static async waiveFine(fineId, notes = '') {
    const fine = await Fine.findByPk(fineId);
    
    if (!fine) {
      throw new Error('Fine not found');
    }

    if (fine.status === 'paid') {
      throw new Error('Cannot waive paid fine');
    }

    return await fine.update({
      status: 'waived',
      notes: notes
    });
  }
}

module.exports = FineService;