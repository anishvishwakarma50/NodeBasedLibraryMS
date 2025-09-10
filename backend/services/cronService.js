// Create services/cronService.js
const cron = require('node-cron');
const FineService = require('./fineService');

class CronService {
  static init() {
    // Run every day at midnight to check for overdue books and generate fines
    cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running daily fine generation...');
        const results = await FineService.generateFinesForOverdueBooks();
        console.log(`Generated fines for ${results.length} overdue books`);
      } catch (error) {
        console.error('Error in daily fine generation:', error);
      }
    });

    console.log('Cron jobs initialized');
  }
}

module.exports = CronService;