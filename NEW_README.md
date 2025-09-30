# 🚀 Budget Baba

A comprehensive, full-stack expense management application built with modern technologies. Track expenses, manage budgets, set financial goals, handle recurring transactions, and get intelligent insights to optimize your financial health.

## ✨ Features

### 📊 **Expense Management**
- **Smart Expense Tracking**: Add expenses with auto-categorization and vendor recognition
- **Bulk Upload**: Import expenses from CSV files with validation
- **Receipt Processing**: Upload and process receipts (with OCR capabilities)
- **Advanced Filtering**: Filter by date, category, amount range, vendor, and tags
- **Real-time Analytics**: Interactive charts and spending patterns

### 🎯 **Budget Management** 
- **Dynamic Budgeting**: Create weekly/monthly/quarterly/yearly budgets
- **Category-wise Budgets**: Set individual limits for different expense categories
- **Smart Alerts**: Get notifications at 75%, 90%, and 100% budget utilization
- **Visual Progress**: Real-time budget utilization with color-coded indicators
- **Auto-rollover**: Unused budget amounts can roll over to next period

### 🎯 **Goal Tracking**
- **Financial Goals**: Set savings targets with deadlines and progress tracking
- **Auto-save Integration**: Automatic progress updates from transactions
- **Milestone Notifications**: Get alerts when reaching goal milestones
- **Goal Analytics**: Track completion rates and performance insights
- **Multiple Goal Types**: Emergency fund, vacation, purchase goals, etc.

### 🔄 **Recurring Transactions**
- **Smart Automation**: Auto-process recurring expenses/income
- **Flexible Scheduling**: Daily, weekly, monthly, quarterly, yearly frequencies
- **Due Date Management**: Never miss a recurring transaction
- **Notification System**: Get alerts before transactions are due
- **Auto-categorization**: Recurring transactions maintain consistent categories

### 💰 **Split Expenses**
- **Group Expense Splitting**: Split bills among friends, family, or colleagues
- **Multiple Split Types**: Equal splits, exact amounts, or custom percentages
- **Payment Tracking**: Track who has paid and who owes money
- **Email Integration**: Send split notifications via Gmail/Outlook
- **Settlement Management**: Mark payments as received with notifications

### 📈 **Advanced Analytics**
- **Spending Insights**: AI-powered analysis of spending patterns
- **Category Analysis**: Detailed breakdown of expenses by category
- **Trend Analysis**: Identify spending trends over time
- **Period Comparisons**: Compare current vs previous periods
- **Vendor Analysis**: Track spending by vendor/merchant
- **Budget Performance**: Comprehensive budget vs actual analysis
- **Predictive Insights**: Smart recommendations based on spending patterns

### 🔔 **Smart Notifications**
- **Real-time Alerts**: Instant notifications via Socket.IO
- **Email Notifications**: Budget alerts, goal milestones, split reminders
- **Customizable Settings**: Control which notifications you receive
- **Priority System**: Critical, high, medium, low priority levels
- **Notification History**: Track all past notifications and actions

### 📋 **Data Export & Reporting**
- **Comprehensive Exports**: Export data in CSV or JSON formats
- **Custom Reports**: Generate detailed financial reports
- **Scheduled Reports**: Weekly/monthly summaries automatically generated
- **Data Backup**: Full account data export for backup purposes
- **Report Analytics**: Performance insights in detailed reports

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Sign in with Google account
- **Password Security**: bcrypt hashing for password protection
- **Rate Limiting**: API protection against abuse
- **CORS Protection**: Secure cross-origin requests

### 📱 **Mobile-First Design**
- **Responsive UI**: Optimized for all screen sizes
- **Touch-friendly**: Mobile-optimized interactions
- **Offline-ready**: PWA capabilities for offline access
- **Fast Loading**: Optimized performance on mobile networks

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Recharts**: Interactive charts and analytics
- **Socket.IO Client**: Real-time updates

### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **node-cron**: Task scheduling
- **nodemailer**: Email functionality

### **Additional Services**
- **Google APIs**: Gmail integration and OAuth
- **Microsoft Graph**: Outlook integration
- **Multer**: File upload handling
- **JSZip**: Archive generation for exports
- **Helmet**: Security headers
- **Express Rate Limit**: API rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB database (local or Atlas)
- Google Cloud Console project (for OAuth and Gmail)
- Basic understanding of React and Node.js

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-expense-tracker
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
cd server
npm install
cd ..
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# or MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Google OAuth & Gmail
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Server
PORT=5000
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Database Setup**
```bash
# Seed the database with sample data (optional)
cd server
npm run seed
```

5. **Start the Application**

**Option 1: Using batch files (Windows)**
```bash
# Start both frontend and backend
start-app.bat
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📋 API Documentation

### **Authentication Endpoints**
```
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login  
POST   /api/auth/logout          # User logout
GET    /api/auth/profile         # Get user profile
PUT    /api/auth/profile         # Update user profile
POST   /api/auth/change-password # Change password
GET    /api/auth/google          # Google OAuth URL
POST   /api/auth/google/callback # Google OAuth callback
```

### **Expense Endpoints**
```
GET    /api/expenses             # Get expenses (with filtering/pagination)
POST   /api/expenses             # Create expense
GET    /api/expenses/:id         # Get expense by ID
PUT    /api/expenses/:id         # Update expense
DELETE /api/expenses/:id         # Delete expense
POST   /api/expenses/upload      # Bulk upload expenses
GET    /api/expenses/categories  # Get expense categories
GET    /api/expenses/analytics   # Get expense analytics
GET    /api/expenses/dashboard/stats # Get dashboard statistics
```

### **Budget Endpoints**
```
GET    /api/budgets              # Get budgets
POST   /api/budgets              # Create budget
GET    /api/budgets/:id          # Get budget by ID
PUT    /api/budgets/:id          # Update budget
DELETE /api/budgets/:id          # Delete budget
GET    /api/budgets/analytics/overview # Get budget analytics
GET    /api/budgets/alerts/check # Check budget alerts
```

### **Goal Endpoints**
```
GET    /api/goals                # Get goals
POST   /api/goals                # Create goal
PUT    /api/goals/:id            # Update goal
DELETE /api/goals/:id            # Delete goal
POST   /api/goals/:id/progress   # Add goal progress
GET    /api/goals/analytics      # Get goal analytics
```

### **Recurring Transaction Endpoints**
```
GET    /api/recurring            # Get recurring transactions
POST   /api/recurring            # Create recurring transaction
PUT    /api/recurring/:id        # Update recurring transaction
DELETE /api/recurring/:id        # Delete recurring transaction
POST   /api/recurring/process    # Process due transactions
GET    /api/recurring/analytics  # Get recurring analytics
```

### **Split Expense Endpoints**
```
GET    /api/splits               # Get splits
POST   /api/splits               # Create split
GET    /api/splits/:id           # Get split details
PUT    /api/splits/:id           # Update split
DELETE /api/splits/:id           # Delete split
PATCH  /api/splits/:id/participants/:email/paid # Mark as paid
POST   /api/splits/:id/participants/:email/remind # Send reminder
GET    /api/splits/summary       # Get split summary
```

### **Analytics Endpoints**
```
GET    /api/analytics/expenses         # Advanced expense analytics
GET    /api/analytics/categories      # Category insights
GET    /api/analytics/spending-trends # Spending trend analysis
GET    /api/analytics/period-comparison # Period comparison
GET    /api/analytics/vendors         # Vendor analysis
GET    /api/analytics/spending-patterns # Spending patterns
GET    /api/analytics/budget          # Budget analytics
GET    /api/analytics/insights        # AI-powered insights
```

### **Notification Endpoints**
```
GET    /api/notifications        # Get notifications
PATCH  /api/notifications/:id/read # Mark as read
PATCH  /api/notifications/mark-all-read # Mark all as read
DELETE /api/notifications/:id    # Delete notification
GET    /api/notifications/settings # Get notification settings
PUT    /api/notifications/settings # Update notification settings
```

### **Export Endpoints**
```
POST   /api/exports/expenses     # Export expenses
POST   /api/exports/splits       # Export splits
POST   /api/exports/budgets      # Export budgets
POST   /api/exports/goals        # Export goals
POST   /api/exports/all          # Export all data
GET    /api/exports/history      # Get export history
POST   /api/exports/report       # Generate comprehensive report
```

### **Email Integration Endpoints**
```
GET    /api/email/status         # Get email connection status
GET    /api/email/gmail/connect  # Get Gmail OAuth URL
GET    /api/email/outlook/connect # Get Outlook OAuth URL
PUT    /api/email/preferences    # Update email preferences
DELETE /api/email/disconnect/:provider # Disconnect email provider
POST   /api/email/test/:provider # Test email connection
```

## 🎯 Advanced Features

### **Automated Scheduling**
The application includes a built-in scheduler that runs:
- **Recurring Transaction Processing**: Every hour
- **Budget Alert Checks**: Daily at 9 AM
- **Goal Reminders**: Daily at 8 AM  
- **Weekly Summaries**: Sundays at 8 AM
- **Notification Cleanup**: Daily at midnight

### **Real-time Updates**
Socket.IO integration provides instant updates for:
- Split expense notifications
- Budget alerts and threshold warnings
- Goal milestone achievements
- Recurring transaction processing
- System notifications

### **Smart Categorization**
- Auto-categorize expenses based on description/vendor
- Machine learning suggestions for categories
- Custom category management
- Bulk category updates

### **Data Export Options**
- **CSV Format**: Spreadsheet-compatible data
- **JSON Format**: Complete data with metadata
- **ZIP Archives**: Multiple file exports
- **Filtered Exports**: Export specific date ranges or categories
- **Scheduled Exports**: Automated weekly/monthly exports

## 🔧 Configuration

### **Environment Variables**

**Required:**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

**Optional:**
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### **Google Services Setup**

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one

2. **Enable APIs**
   - Enable Gmail API
   - Enable Google OAuth2 API

3. **Configure OAuth Consent Screen**
   - Set application name and details
   - Add authorized domains

4. **Create OAuth Credentials**
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs
   - Copy client ID and secret to `.env`

### **Database Configuration**

**MongoDB Atlas (Recommended):**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense-tracker
```

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

## 📱 Usage Guide

### **Getting Started**
1. **Register Account**: Create account with email/password or Google OAuth
2. **Set Monthly Budget**: Configure your monthly budget limit
3. **Add First Expense**: Create your first expense entry
4. **Create Budget**: Set up category-wise budget limits
5. **Set Goals**: Create financial savings goals

### **Daily Usage**
1. **Quick Add**: Use the quick expense form on dashboard
2. **Receipt Upload**: Photograph receipts for automatic processing
3. **Split Bills**: Share expenses with friends/family
4. **Check Progress**: Monitor budget utilization and goal progress
5. **Review Analytics**: Check spending insights and trends

### **Advanced Features**
1. **Recurring Setup**: Configure recurring income/expenses
2. **Export Data**: Download comprehensive reports
3. **Email Integration**: Connect Gmail/Outlook for notifications  
4. **Goal Tracking**: Set up automatic savings transfers
5. **Budget Optimization**: Use AI insights for better budgeting

## 🔒 Security Features

- **JWT Authentication**: Secure API access with JSON Web Tokens
- **Password Hashing**: bcrypt protection for user passwords
- **Rate Limiting**: API abuse protection
- **CORS Security**: Controlled cross-origin resource sharing
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: MongoDB parameterized queries
- **XSS Protection**: Content Security Policy headers

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries with indexes
- **Lazy Loading**: Component-based code splitting
- **Caching**: API response caching for better performance
- **Compression**: Gzip compression for API responses  
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Optimized JavaScript bundles

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review API endpoints and examples

## 🎉 Acknowledgments

- Built with modern React and Node.js ecosystem
- UI components powered by shadcn/ui
- Icons from Lucide React
- Charts powered by Recharts
- Real-time features by Socket.IO

---

## 📊 Project Statistics

- **Frontend Components**: 25+ reusable UI components
- **Backend Endpoints**: 50+ REST API endpoints
- **Database Models**: 8 comprehensive Mongoose schemas
- **Real-time Features**: Socket.IO integration across all features
- **Authentication Methods**: JWT + Google OAuth
- **Export Formats**: CSV, JSON, ZIP archives
- **Notification Types**: 10+ different notification categories
- **Analytics Insights**: 8 comprehensive analytics endpoints

**Built with ❤️ using Next.js, Node.js, and MongoDB**