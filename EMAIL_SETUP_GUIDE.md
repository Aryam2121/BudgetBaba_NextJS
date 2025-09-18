# 📧 Email Setup Guide for Split Notifications

Your Smart Expense Tracker is now configured to send email notifications when expenses are split. Here's how to track and enable email sending:

## 🔍 How to Monitor Email Sending

### 1. **Development Mode (Current Setup)**
- Emails are **NOT actually sent** but are logged to the console
- Check the server terminal to see email notifications
- Look for these log messages:
  ```
  📧 Preparing to send split notifications to X participants...
  📤 Sending email 1/2 to participant@email.com (Amount: ₹150.00)
  ✅ Email successfully sent to participant@email.com
  📝 Development mode - Check console for email content
  ```

### 2. **Console Email Content**
When you create a split, the server terminal will show:
- Number of participants being notified
- Each email being "sent" (logged)
- Full email content including HTML templates
- Success/failure status for each email

### 3. **Frontend Visual Indicators**
- ✅ Green checkmark: Email sent successfully
- ❌ Red X: Email failed to send  
- ⏳ Clock: Email pending/not sent
- Hover over icons to see detailed status

## 🚀 Enable Real Email Sending

To actually send emails to participants, follow these steps:

### Step 1: Get Gmail App Password
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to "App passwords" 
4. Generate a new app password for "Mail"
5. Copy the generated password (16 characters)

### Step 2: Update .env File
Edit your `.env` file and update these values:
```env
# Replace with your actual Gmail credentials
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-16-character-app-password
MAIL_FROM=your-email@gmail.com
SEND_REAL_EMAILS=true
```

### Step 3: Restart Server
```bash
# Stop the server (Ctrl+C) and restart:
cd "d:\\smart Expense Tracker\\server"
npm start
```

## 📋 Testing Email Functionality

### Quick Test Steps:
1. **Open browser**: http://localhost:3000
2. **Login** with your account
3. **Go to Dashboard** and find any expense
4. **Click "Split" button** on an expense
5. **Add participant email** (use a real email you can check)
6. **Create the split**
7. **Check server logs** for email status

### What You'll See in Logs:
```
📧 Preparing to send split notifications to 1 participants...
📤 Sending email 1/1 to friend@example.com (Amount: ₹150.00)
✅ Email successfully sent to friend@example.com
📧 Email Message ID: <some-message-id@gmail.com>
```

## 🔧 Email Features

### **Split Notification Email**
- **When**: Automatically sent when expense is split
- **To**: All split participants
- **Content**: 
  - Split details and amount owed
  - Payment instructions
  - Contact creator button
  - Professional HTML template

### **Reminder Email**
- **When**: When "Send Reminder" is clicked
- **To**: Participants who haven't paid
- **Content**:
  - Payment reminder
  - Days overdue
  - Payment options
  - Contact information

### **Settlement Email**
- **When**: Someone is marked as "paid"
- **To**: Expense creator
- **Content**:
  - Payment confirmation
  - Updated split status

## 📊 Monitoring Split Status

### In the App:
1. **Splits Page**: Visit `/splits` to see all your splits
2. **Email Status**: Each participant shows email delivery status
3. **Payment Status**: Track who has paid and who hasn't
4. **Actions**: Send reminders, mark as paid, etc.

### In Server Logs:
- All email activities are logged with detailed status
- Failed emails show error messages
- Success emails show message IDs

## 🐛 Troubleshooting

### Emails Not Sending?
1. **Check .env file**: Ensure all email variables are set
2. **Verify credentials**: Test your Gmail app password
3. **Check logs**: Look for error messages in server terminal
4. **Network issues**: Ensure server can reach Gmail SMTP

### Development Mode Issues?
- If `SEND_REAL_EMAILS=false`, emails will only be logged
- Change to `SEND_REAL_EMAILS=true` to actually send emails
- Restart server after changing .env file

### Gmail Authentication Errors?
- Ensure 2FA is enabled on your Google account
- Use App Password, not your regular Gmail password
- Check if Gmail is allowing the connection

## 📱 How Participants Know They're Added

### Email Notification Contains:
- **Split Title**: Clear expense description
- **Amount Owed**: Exact amount they need to pay
- **Payment Instructions**: How to pay the creator
- **Contact Button**: Easy way to reach the expense creator
- **Professional Design**: Clear, easy-to-read format

### Example Email Subject:
`💰 Split Request: ₹150.00 - Restaurant Bill - Team Dinner`

---

## 🎯 Current Status Summary

✅ **Split functionality working**
✅ **Email templates ready**  
✅ **Logging system active**
✅ **Development mode enabled**
⚠️ **Real email sending requires Gmail setup**

**Next Step**: Add your Gmail credentials to enable actual email sending, or continue testing with console logging!
