# 🎯 How to Track Split Email Notifications

## ✅ **Current Setup Status:**
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 3000  
- ✅ Split functionality fully implemented
- ✅ Email logging system active
- ✅ Development mode enabled (emails logged, not sent)

---

## 📧 **How to Know When Emails Are "Sent"**

### **Method 1: Server Console Logs (Primary)**

When you create a split, check the **server terminal window** for messages like:

```
📧 Preparing to send split notifications to 2 participants...
📤 Sending email 1/2 to friend@example.com (Amount: ₹150.00)
✅ Email successfully sent to friend@example.com
📝 Development mode - Check console for email content
📤 Sending email 2/2 to another@example.com (Amount: ₹150.00)  
✅ Email successfully sent to another@example.com
📝 Development mode - Check console for email content
```

**What Each Icon Means:**
- 📧 = Starting email sending process
- 📤 = Individual email being sent
- ✅ = Email successfully "sent" (logged in dev mode)
- ❌ = Email failed to send
- 📝 = Development mode message

### **Method 2: Frontend Visual Indicators**

In your splits page (`/splits`), you'll see:
- ✅ **Green checkmark**: Email sent successfully
- ❌ **Red X**: Email sending failed
- ⏳ **Clock icon**: Email pending/not attempted
- Hover over icons for detailed tooltips

### **Method 3: Email Content Preview**

The server logs show the complete email content that would be sent:

```
📧 Split notification email (dev mode): {
  to: 'participant@email.com',
  data: {
    participantName: 'John Doe',
    creatorName: 'Your Name', 
    splitTitle: 'Restaurant Bill - Dinner',
    amount: 150,
    totalAmount: 300,
    description: 'Team dinner at restaurant'
  }
}
```

---

## 🧪 **Test Split Email Flow**

### **Step-by-Step Test:**

1. **Open Application**: Visit `http://localhost:3000`

2. **Login**: Use your existing account

3. **Go to Dashboard**: You'll see recent expenses

4. **Click "Split" on any expense**: This opens the split dialog

5. **Add Participants**:
   ```
   Name: Test Friend
   Email: test@example.com
   ```

6. **Create Split**: Click "Create Split" button

7. **Check Server Logs**: Switch to the server terminal window

8. **Look for Email Messages**: You should see:
   ```
   📧 Preparing to send split notifications to 1 participants...
   📤 Sending email 1/1 to test@example.com (Amount: ₹XX.XX)
   ✅ Email successfully sent to test@example.com
   📝 Development mode - Check console for email content
   ```

9. **Check Splits Page**: Visit `/splits` to see visual email status

---

## 🔄 **Current Email States**

### **Development Mode** (Current Setup):
- **SEND_REAL_EMAILS=false** in your .env file
- Emails are **logged to console** instead of actually sent
- All email content is displayed for review
- Perfect for testing and development

### **Production Mode** (When Ready):
- **SEND_REAL_EMAILS=true** + Gmail credentials
- Emails are **actually sent** to participants  
- Real email delivery to inboxes
- Requires Gmail App Password setup

---

## 📊 **Email Status Tracking**

### **In the App Interface:**

**Splits Page Features:**
- **Email Status Summary**: Shows count of sent/failed/pending emails per split
- **Individual Status**: Each participant shows their email status
- **Tooltips**: Hover for detailed information
- **Visual Indicators**: Color-coded status icons

**Recent Expenses:**
- Split button available on each expense
- Immediate email sending when split is created
- Real-time status updates

---

## 🚀 **Quick Test Right Now**

**Try this immediately:**

1. Keep your server terminal visible
2. Open browser: `http://localhost:3000`
3. Login and go to dashboard
4. Click "Split" on any expense
5. Add a test participant with any email
6. Click "Create Split"
7. **Watch the server terminal** - you'll see the email logs!

**Expected Output:**
```
📧 Preparing to send split notifications to 1 participants...
📤 Sending email 1/1 to your-test@email.com (Amount: ₹XX.XX)
✅ Email successfully sent to your-test@email.com  
📝 Development mode - Check console for email content
📧 Split notification email (dev mode): {
  to: 'your-test@email.com',
  data: { ... email content preview ... }
}
```

---

## 🔧 **Troubleshooting**

### **No Email Logs Appearing?**
- Check if server is running on port 5000
- Ensure you're looking at the server terminal (not frontend)
- Try creating a new split to trigger emails

### **Email Status Not Showing?**
- Refresh the splits page
- Check browser console for any errors
- Ensure you're logged in properly

### **Want Real Email Sending?**
- Follow the Gmail setup in `EMAIL_SETUP_GUIDE.md`
- Update .env file with your credentials
- Change `SEND_REAL_EMAILS=true`
- Restart the server

---

**🎉 You now have full visibility into when split emails are being sent!**
