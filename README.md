# Budget Baba

A comprehensive full-stack expense tracking application with advanced analytics, goal tracking, automated recurring transactions, real-time notifications, and intelligent expense management.

## 🚀 Features

### Core Features
- **Dashboard**: Real-time expense overview with interactive charts and quick actions
- **Expense Management**: Add, categorize, and track expenses with receipt upload
- **Budget Tracking**: Set budgets by category with real-time progress monitoring
- **Expense Splits**: Share expenses with friends and groups with settlement tracking
- **Advanced Analytics**: Interactive charts, trend analysis, and spending insights

### New Advanced Features (Phase 3)
- **🎯 Goals Tracking**: Set and track financial goals with milestones and progress monitoring
- **🔄 Recurring Transactions**: Automated recurring transaction management with scheduling
- **🔔 Real-time Notifications**: Push notifications with Socket.IO integration and priority filtering
- **📊 Enhanced Analytics**: Advanced analytics dashboard with multiple chart types and insights
- **💰 Smart Budget Management**: Category-based budgets with real-time alerts and tracking
- **📋 Data Export System**: Comprehensive export functionality with multiple formats (CSV, JSON, PDF, ZIP)
- **📈 System Status Dashboard**: Real-time system health monitoring and API status tracking

## 🛠 Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components library
- **Recharts** for data visualization
- **Socket.IO Client** for real-time updates

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Socket.IO** for real-time features
- **Nodemailer** for email notifications
- **Multer** for file uploads
- **Node-cron** for scheduling

### Key Libraries
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Zod** for validation
- **Date-fns** for date manipulation
- **Sonner** for toast notifications

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── expenses/          # Expense management pages
│   ├── budget/           # Budget tracking page
│   ├── goals/            # Goals tracking page (NEW)
│   ├── recurring/        # Recurring transactions page (NEW)
│   ├── notifications/    # Notifications center page (NEW)
│   ├── analytics/        # Enhanced analytics page (UPDATED)
│   ├── exports/          # Data export page (NEW)
│   ├── splits/           # Expense splitting page
│   ├── system-status/    # System status dashboard (NEW)
│   └── auth/             # Authentication pages
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── charts/           # Chart components
│   ├── NotificationCenter.tsx    # Real-time notifications (NEW)
│   ├── GoalsTracking.tsx         # Financial goals management (NEW)
│   ├── RecurringTransactions.tsx # Recurring transactions (NEW)
│   ├── AnalyticsDashboard.tsx    # Advanced analytics (NEW)
│   ├── BudgetManagement.tsx      # Enhanced budgets (NEW)
│   ├── ExportDashboard.tsx       # Data export system (NEW)
│   ├── ModernSidebar.tsx         # Updated navigation (UPDATED)
│   ├── ModernTopBar.tsx          # Updated top bar (UPDATED)
│   └── DashboardLayout.tsx       # Layout wrapper
│
├── server/               # Backend server
│   ├── controllers/      # API controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── services/        # Business logic services
│
├── lib/                 # Frontend utilities
│   ├── api.ts          # API client (50+ methods)
│   └── utils.ts        # Helper functions
│
└── contexts/           # React contexts
    └── AuthContext.tsx # Authentication context
```

## 🎯 New Components & Features

### 1. NotificationCenter.tsx
- Real-time Socket.IO integration
- Priority-based notification filtering
- Mark as read/unread functionality
- Push notification support
- Notification history and management

### 2. GoalsTracking.tsx
- Financial goal creation and editing
- Progress tracking with visual indicators
- Milestone notifications
- Goal categorization and analytics
- Target date management

### 3. RecurringTransactions.tsx
- Automated transaction scheduling
- Pause/resume functionality
- Multiple frequency options (daily, weekly, monthly, yearly)
- Next execution date tracking
- Recurring transaction history

### 4. AnalyticsDashboard.tsx
- Interactive Recharts integration
- Multiple analytics tabs (Overview, Trends, Categories, Insights)
- Spending velocity tracking
- Category analysis with insights
- Export functionality for analytics data

### 5. BudgetManagement.tsx
- Category-based budget allocation
- Real-time spending tracking
- Budget alerts and notifications
- Progress visualization
- Budget vs actual spending comparison

### 6. ExportDashboard.tsx
- Multi-format data export (CSV, JSON, PDF, ZIP)
- Export history tracking
- Filtered export options
- Scheduled export functionality
- Download progress tracking

## 🔌 API Integration

The application includes 50+ API endpoints covering:

### Core APIs
- Authentication (login, register, refresh)
- Expense management (CRUD operations)
- Budget tracking and management
- Split expense functionality

### Advanced APIs (NEW)
- **Goals API**: Goal CRUD, progress tracking, analytics
- **Recurring API**: Transaction scheduling, automation
- **Notifications API**: Real-time notifications, settings
- **Analytics API**: Advanced analytics, trends, insights
- **Export API**: Data export in multiple formats
- **System API**: Health checks, status monitoring

## 🔄 Real-time Features

- **Socket.IO Integration**: Real-time notifications and updates
- **Live Data Updates**: Automatic data refresh across components
- **Push Notifications**: Browser push notification support
- **Real-time Charts**: Live updating analytics charts
- **System Health Monitoring**: Real-time system status tracking

## 📱 Mobile Responsiveness

All components are built with mobile-first design:
- Responsive grid layouts
- Touch-friendly interfaces
- Mobile navigation optimization
- Swipe gestures support
- Progressive Web App features

## 🎨 UI/UX Features

- **Modern Design**: Glass morphism and gradient effects
- **Dark Mode Support**: System theme integration
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: ARIA labels and keyboard navigation
- **Toast Notifications**: Real-time feedback system

## 🔧 Development Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd smart-expense-tracker
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server
   npm install
   ```

3. **Environment Variables**
   ```env
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your-jwt-secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - System Status: `http://localhost:3000/system-status`

## 🚀 Deployment

### Using the provided scripts:
```bash
# Start all services
./start-app.bat       # Windows (All services)
./start-frontend.bat  # Frontend only
./start-server.bat    # Backend only
```

### Production deployment:
1. Build the frontend: `npm run build`
2. Start the backend: `cd server && npm start`
3. Configure environment variables for production
4. Set up MongoDB connection
5. Configure email service (SMTP)

## 📊 System Monitoring

Access the **System Status Dashboard** at `/system-status` to monitor:
- Overall system health (95%+)
- Frontend/Backend status
- Database connectivity
- API endpoint health
- Real-time integration status
- Module status and versions

## 🧪 Testing

- **Component Testing**: Test all new React components
- **API Testing**: Test all 50+ API endpoints
- **Integration Testing**: Test Socket.IO and real-time features
- **Mobile Testing**: Test responsive design on various devices
- **Performance Testing**: Monitor loading times and responsiveness

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- SQL injection prevention
- XSS protection

## 📈 Performance Optimizations

- Lazy loading of components
- Image optimization
- API response caching
- Database query optimization
- Bundle splitting
- Service worker for PWA features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆕 Recent Updates (Phase 3)

### Major Features Added:
- ✅ Real-time Notification Center with Socket.IO
- ✅ Comprehensive Goals Tracking System
- ✅ Automated Recurring Transactions
- ✅ Advanced Analytics Dashboard with Recharts
- ✅ Enhanced Budget Management System
- ✅ Multi-format Data Export System
- ✅ System Status Monitoring Dashboard
- ✅ Updated Navigation with all new pages
- ✅ Mobile-responsive design for all components
- ✅ Real-time updates across all modules

### Technical Improvements:
- ✅ 6 new React components with TypeScript
- ✅ 5 new pages with complete functionality
- ✅ 50+ API endpoints with comprehensive coverage
- ✅ Socket.IO real-time integration
- ✅ Enhanced UI/UX with modern design patterns
- ✅ Comprehensive error handling and loading states
- ✅ Mobile-first responsive design

---

**Budget Baba** - Your comprehensive solution for intelligent expense management with advanced analytics, goal tracking, and real-time features.
