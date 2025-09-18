# Smart Expense Tracker MVP

A full-stack expense tracking application with intelligent categorization, budget management, and email notifications.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Expense Management**: Add, view, and categorize expenses with auto-categorization
- **Budget Tracking**: Set monthly budgets with real-time alerts and predictions
- **Email Notifications**: Instant notifications for expenses, budget alerts, and weekly summaries
- **CSV Upload**: Bulk import expenses from CSV files
- **Interactive Dashboard**: Charts and visualizations using Recharts
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **shadcn/ui** - Modern UI components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email sending functionality
- **bcryptjs** - Password hashing

## Project Structure

\`\`\`
smart-expense-tracker/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard
│   ├── expenses/                 # Expense management pages
│   ├── budget/                   # Budget management
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── charts/                   # Chart components
│   ├── ui/                       # shadcn/ui components
│   └── *.tsx                     # Feature components
├── contexts/                     # React contexts
├── lib/                          # Utility libraries
├── server/                       # Express.js backend
│   ├── controllers/              # Route controllers
│   ├── models/                   # Mongoose models
│   ├── routes/                   # API routes
│   ├── utils/                    # Utility functions
│   ├── middleware/               # Custom middleware
│   └── server.js                 # Server entry point
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
\`\`\`

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Email service credentials (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd smart-expense-tracker
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   \`\`\`

4. **Start the application**
   \`\`\`bash
   # Start backend server (in one terminal)
   cd server
   npm run dev
   
   # Start frontend (in another terminal)
   npm run dev
   \`\`\`

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=Smart Expense Tracker <your-email@gmail.com>

# Development Settings
NODE_ENV=development
SEND_REAL_EMAILS=false

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### Email Setup

#### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App passwords
3. Use the app password as `MAIL_PASS`

#### SendGrid Setup
\`\`\`env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=your-sendgrid-api-key
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/budget` - Update monthly budget

### Expenses
- `GET /api/expenses` - Get user expenses (with filters)
- `POST /api/expenses` - Add new expense
- `POST /api/expenses/upload` - Bulk upload from CSV
- `GET /api/expenses/summary/monthly` - Monthly summary and trends

## Features in Detail

### Auto-Categorization

The system automatically categorizes expenses based on vendor names and descriptions:

- **Food**: Zomato, Swiggy, restaurants, groceries
- **Transport**: Uber, Ola, fuel, parking
- **Shopping**: Amazon, Flipkart, electronics
- **Entertainment**: Netflix, movies, subscriptions
- **Bills**: Electricity, internet, mobile recharge
- **Healthcare**: Hospitals, medicines, insurance
- **Education**: Schools, courses, books

### Budget Management

- Set monthly spending limits
- Real-time budget tracking with visual progress bars
- Three levels of alerts:
  - **90% Warning**: When approaching budget limit
  - **Budget Exceeded**: When limit is crossed
  - **Predictive Alerts**: Based on spending patterns

### Email Notifications

- **Expense Notifications**: Instant alerts for new expenses
- **Budget Alerts**: Warnings when approaching or exceeding limits
- **Weekly Summaries**: Spending breakdown and insights
- **Bulk Upload Confirmations**: CSV processing results

### CSV Upload Format

Your CSV file should include these columns (case-insensitive):
- `amount` (required) - Expense amount
- `date` (required) - Transaction date (YYYY-MM-DD)
- `vendor` (optional) - Store or service name
- `note` (optional) - Additional description

Example CSV:
\`\`\`csv
amount,date,vendor,note
25.50,2024-01-15,Zomato,Lunch order
500.00,2024-01-14,Uber,Ride to airport
1200.00,2024-01-13,Amazon,Mobile phone
\`\`\`

## Development

### Running Tests

\`\`\`bash
# Backend tests
cd server
npm test

# Test categorization logic
node scripts/test-categorization.js
\`\`\`

### Database Seeding

\`\`\`bash
# Create sample data
cd server
node scripts/seed-database.js
\`\`\`

### Weekly Summary Automation

Set up a cron job to send weekly summaries:

\`\`\`bash
# Add to crontab (runs every Sunday at 9 AM)
0 9 * * 0 cd /path/to/project && node scripts/send-weekly-summary.js
\`\`\`

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Heroku (Backend)

1. Create a new project
2. Connect your repository
3. Set environment variables
4. Deploy the `server` directory

### MongoDB Atlas

1. Create a free cluster at mongodb.com
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with expiration
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large expense lists
- Efficient aggregation queries for charts
- Client-side caching with React state
- Optimized bundle size with Next.js

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Email not sending**
- Check email credentials and app passwords
- Verify `SEND_REAL_EMAILS=true` in production
- Check spam folder for test emails

**Database connection failed**
- Verify MongoDB is running locally
- Check connection string format
- Ensure network access for cloud databases

**Charts not displaying**
- Check if data is being fetched correctly
- Verify Recharts is installed
- Check browser console for errors

**CSV upload failing**
- Ensure CSV has required columns (amount, date)
- Check file size (max 5MB)
- Verify date format (YYYY-MM-DD)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

Built with ❤️ using Next.js, Express.js, and MongoDB
