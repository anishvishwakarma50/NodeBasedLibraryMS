const sequelize = require("../config/database").sequelize;
const Student = require('./Student');
const Librarian = require('./Librarian');
const Book = require('./Book');
const IssuedBook = require('./IssuedBook');
const SuggestedBook = require('./SuggestedBook');
const Course = require('./Course');


// Define associations
Student.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(Student, { foreignKey: 'course_id', as: 'students' });

Book.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(Book, { foreignKey: 'course_id', as: 'books' });

IssuedBook.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
IssuedBook.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
IssuedBook.belongsTo(Librarian, { foreignKey: 'librarian_id', as: 'librarian' });

Student.hasMany(IssuedBook, { foreignKey: 'student_id', as: 'issuedBooks' });
Book.hasMany(IssuedBook, { foreignKey: 'book_id', as: 'issuedBooks' });
Librarian.hasMany(IssuedBook, { foreignKey: 'librarian_id', as: 'issuedBooks' });

SuggestedBook.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
SuggestedBook.belongsTo(Librarian, { foreignKey: 'reviewed_by', as: 'reviewer' });
Student.hasMany(SuggestedBook, { foreignKey: 'student_id', as: 'suggestedBooks' });

module.exports = {
  sequelize,
  Student,
  Librarian,
  Book,
  IssuedBook,
  SuggestedBook,
  Course
};

