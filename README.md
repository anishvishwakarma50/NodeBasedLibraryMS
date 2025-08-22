# LBManage - Complete Library Management System

A full-stack Library Management System built with modern web technologies, featuring role-based authentication, comprehensive book management, and mobile-responsive design.

## 🚀 Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **SQLite** - Database (easily configurable to MySQL/PostgreSQL)
- **Sequelize ORM** - Database modeling and migrations
- **JWT (JSON Web Tokens)** - Authentication and authorization
- **Swagger UI** - API documentation
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** with **Vite** - Modern frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Features
- **Mobile-Responsive Design** - Works perfectly on all devices
- **Role-Based Authentication** - Student and Librarian roles
- **JWT Authentication** - Secure token-based auth
- **Real-time API Integration** - Frontend and backend working together
- **Comprehensive CRUD Operations** - Full data management
- **Search and Filter** - Advanced book discovery
- **Book Issue/Return System** - Complete library workflow
- **Suggestion System** - Students can suggest new books
- **Dashboard Analytics** - Overview of library statistics

## 📁 Project Structure

```
lbmanage-fullstack/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/           # API utilities
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── dist/              # Production build
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## 🗄️ Database Schema

### Tables
1. **Students** - Student information and authentication
2. **Librarians** - Librarian information and authentication
3. **Courses** - Academic courses (MCA, MMS, PGDM)
4. **Books** - Book catalog with availability tracking
5. **IssuedBooks** - Book borrowing records
6. **SuggestedBooks** - Student book suggestions

### Relationships
- Students belong to Courses
- Books can belong to Courses
- IssuedBooks link Students and Books
- SuggestedBooks link Students and Books

## 🔐 Authentication System

### JWT Implementation
- Secure token-based authentication
- Role-based access control (Student/Librarian)
- Protected routes and API endpoints
- Automatic token refresh

### User Roles
- **Students**: Browse books, borrow/return, suggest books, view history
- **Librarians**: Manage books, students, issue/return books, review suggestions

## 📱 Mobile Responsiveness

- **Responsive Grid Layouts** - Adapts to all screen sizes
- **Mobile-First Design** - Optimized for mobile devices
- **Touch-Friendly Interface** - Large buttons and easy navigation
- **Collapsible Sidebar** - Space-efficient navigation on mobile
- **Responsive Tables** - Data tables adapt to small screens

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```

### Environment Variables
Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
DB_NAME=lbmanage
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration
- `POST /api/auth/logout` - User logout

### Books Management
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book (Librarian)
- `PUT /api/books/:id` - Update book (Librarian)
- `DELETE /api/books/:id` - Delete book (Librarian)

### Student Management
- `GET /api/students` - Get all students (Librarian)
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student profile

### Book Operations
- `POST /api/issued-books` - Issue book to student
- `PUT /api/issued-books/:id/return` - Return book
- `GET /api/issued-books` - Get issued books

### Suggestions
- `GET /api/suggested-books` - Get book suggestions
- `POST /api/suggested-books` - Submit book suggestion
- `PUT /api/suggested-books/:id/review` - Review suggestion (Librarian)

## 📊 Features Overview

### Student Features
- **Dashboard** - Overview of borrowed books, reservations, overdue items
- **Browse Books** - Search and filter books by title, author, course
- **My Books** - View currently borrowed books and due dates
- **Book Suggestions** - Suggest new books for library acquisition
- **Profile Management** - Update personal information

### Librarian Features
- **Dashboard** - Library statistics and recent activity
- **Book Management** - Add, edit, delete books from catalog
- **Student Management** - View and manage student accounts
- **Issue/Return** - Process book loans and returns
- **Suggestion Review** - Approve or reject student suggestions
- **Reports** - Generate library usage reports

## 🔧 Configuration

### Database Configuration
The system uses SQLite by default for development. To use MySQL:

1. Install MySQL driver: `npm install mysql2`
2. Update `config/database.js` with MySQL credentials
3. Set environment variables for database connection

### CORS Configuration
The backend is configured to accept requests from multiple frontend ports:
- http://localhost:5173 (Vite default)
- http://localhost:5174 (Alternative port)
- http://localhost:3000 (Create React App)

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
pnpm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm start
# Deploy to your Node.js hosting service
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure database connection for production
- Set secure JWT secret
- Configure CORS for production domain

## 🧪 Testing

### Manual Testing Completed
- ✅ Student registration and login
- ✅ Librarian login
- ✅ Role-based dashboard access
- ✅ Mobile responsive design
- ✅ API integration
- ✅ Database operations
- ✅ Authentication flow
- ✅ CORS configuration

### Test Accounts
- **Student**: student@example.com / password123
- **Librarian**: librarian@example.com / password123

## 📝 API Documentation

Access Swagger documentation at: `http://localhost:5000/api-docs`

The API documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses

## 🔒 Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **JWT Tokens** - Secure authentication tokens
- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - Protection against API abuse
- **Helmet.js** - Security headers for Express

## 🎨 UI/UX Features

- **Dark Mode Support** - Toggle between light and dark themes
- **Professional Design** - Clean, modern interface
- **Intuitive Navigation** - Easy-to-use sidebar navigation
- **Loading States** - Visual feedback for async operations
- **Error Handling** - User-friendly error messages
- **Responsive Cards** - Information displayed in organized cards

## 📈 Future Enhancements

- Email notifications for due dates
- Barcode scanning for books
- Advanced reporting and analytics
- Book reservation system
- Fine calculation for overdue books
- Integration with external book APIs
- Mobile app development
- Advanced search with filters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**LBManage** - Making library management simple, efficient, and modern! 📚✨

