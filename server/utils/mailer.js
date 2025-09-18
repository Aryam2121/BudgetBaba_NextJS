const nodemailer = require("nodemailer")

class MailService {
  constructor() {
    this.transporter = null
    this.initializeTransporter()
  }

  initializeTransporter() {
    const config = {
      service: process.env.MAIL_SERVICE || "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    }

    // Support for custom SMTP settings
    if (process.env.MAIL_HOST) {
      config.host = process.env.MAIL_HOST
      config.port = process.env.MAIL_PORT || 587
      config.secure = process.env.MAIL_SECURE === "true"
      delete config.service
    }

    this.transporter = nodemailer.createTransport(config)
  }

  async sendExpenseNotification(userEmail, expenseData, budgetInfo) {
    // Skip sending real emails in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Email notification (dev mode):", {
        to: userEmail,
        expense: expenseData,
        budget: budgetInfo,
      })
      return { success: true, mode: "development" }
    }

    const { amount, category, date, note, vendor } = expenseData
    const { totalSpent, budgetLeft, alerts, monthlyBudget } = budgetInfo

    const alertsHtml =
      alerts.length > 0
        ? `<div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
           <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Budget Alerts</h3>
           ${alerts.map((alert) => `<p style="margin: 5px 0; color: #dc2626;">${alert.message}</p>`).join("")}
         </div>`
        : ""

    const recommendation = this.generateRecommendation(category, budgetInfo)

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">💰 New Expense Added</h2>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Expense Details</h3>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString("en-IN")}</p>
          ${vendor ? `<p><strong>Vendor:</strong> ${vendor}</p>` : ""}
          ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
        </div>

        ${alertsHtml}

        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #0369a1; margin: 0 0 10px 0;">📊 Monthly Summary</h3>
          <p><strong>Total Spent This Month:</strong> ₹${totalSpent.toFixed(2)}</p>
          ${monthlyBudget > 0 ? `<p><strong>Budget Remaining:</strong> ₹${budgetLeft.toFixed(2)}</p>` : ""}
        </div>

        ${
          recommendation
            ? `
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #16a34a; margin: 0 0 10px 0;">💡 Recommendation</h3>
            <p style="margin: 0; color: #16a34a;">${recommendation}</p>
          </div>
        `
            : ""
        }

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated notification from your Smart Expense Tracker.
        </p>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: userEmail,
      subject: `💰 New Expense: ₹${amount} - ${category}`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Email sending failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendWeeklySummary(userEmail, userName, weeklyData) {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Weekly summary email (dev mode):", {
        to: userEmail,
        data: weeklyData,
      })
      return { success: true, mode: "development" }
    }

    const { totalSpent, expenseCount, topCategories, budgetInfo } = weeklyData

    const categoriesHtml = topCategories
      .map(
        (cat) =>
          `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${cat.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${cat.total.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${cat.count}</td>
      </tr>`,
      )
      .join("")

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">📊 Your Weekly Expense Summary</h2>
        
        <p>Hi ${userName},</p>
        <p>Here's your spending summary for the past week:</p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Week Overview</h3>
          <p><strong>Total Spent:</strong> ₹${totalSpent.toFixed(2)}</p>
          <p><strong>Number of Transactions:</strong> ${expenseCount}</p>
          <p><strong>Average per Transaction:</strong> ₹${expenseCount > 0 ? (totalSpent / expenseCount).toFixed(2) : "0.00"}</p>
        </div>

        ${
          topCategories.length > 0
            ? `
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Top Spending Categories</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Category</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Amount</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Count</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesHtml}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          budgetInfo && budgetInfo.monthlyBudget > 0
            ? `
        <div style="background-color: ${budgetInfo.budgetLeft >= 0 ? "#f0fdf4" : "#fef2f2"}; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: ${budgetInfo.budgetLeft >= 0 ? "#16a34a" : "#dc2626"}; margin: 0 0 10px 0;">💰 Monthly Budget Status</h3>
          <p><strong>Monthly Budget:</strong> ₹${budgetInfo.monthlyBudget.toFixed(2)}</p>
          <p><strong>Spent So Far:</strong> ₹${budgetInfo.totalSpent.toFixed(2)}</p>
          <p><strong>Remaining:</strong> ₹${budgetInfo.budgetLeft.toFixed(2)}</p>
        </div>
        `
            : ""
        }

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #16a34a; margin: 0 0 10px 0;">💡 Keep it up!</h3>
          <p style="margin: 0; color: #16a34a;">
            Regular tracking helps you stay on top of your finances. 
            ${budgetInfo && budgetInfo.budgetLeft > 0 ? "You're doing great staying within budget!" : "Consider reviewing your spending patterns."}
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is your weekly summary from Smart Expense Tracker.
        </p>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: userEmail,
      subject: `📊 Weekly Expense Summary - ₹${totalSpent.toFixed(2)} spent`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Weekly summary email failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendBudgetAlert(userEmail, userName, alertData) {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Budget alert email (dev mode):", {
        to: userEmail,
        alert: alertData,
      })
      return { success: true, mode: "development" }
    }

    const { alertType, message, budgetInfo, recommendations } = alertData

    const alertColors = {
      budget_exceeded: { bg: "#fef2f2", color: "#dc2626", icon: "🚨" },
      budget_warning: { bg: "#fef3c7", color: "#d97706", icon: "⚠️" },
      budget_prediction: { bg: "#fef3c7", color: "#d97706", icon: "📈" },
    }

    const alertStyle = alertColors[alertType] || alertColors["budget_warning"]

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">${alertStyle.icon} Budget Alert</h2>
        
        <p>Hi ${userName},</p>

        <div style="background-color: ${alertStyle.bg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${alertStyle.color};">
          <h3 style="margin: 0 0 10px 0; color: ${alertStyle.color};">Alert Details</h3>
          <p style="color: ${alertStyle.color}; font-weight: 500;">${message}</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Current Budget Status</h3>
          <p><strong>Monthly Budget:</strong> ₹${budgetInfo.monthlyBudget.toFixed(2)}</p>
          <p><strong>Amount Spent:</strong> ₹${budgetInfo.totalSpent.toFixed(2)}</p>
          <p><strong>Remaining:</strong> ₹${budgetInfo.budgetLeft.toFixed(2)}</p>
          <p><strong>Percentage Used:</strong> ${((budgetInfo.totalSpent / budgetInfo.monthlyBudget) * 100).toFixed(1)}%</p>
        </div>

        ${
          recommendations && recommendations.length > 0
            ? `
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #16a34a; margin: 0 0 10px 0;">💡 Recommendations</h3>
          <ul style="margin: 0; padding-left: 20px; color: #16a34a;">
            ${recommendations.map((rec) => `<li style="margin: 5px 0;">${rec}</li>`).join("")}
          </ul>
        </div>
        `
            : ""
        }

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated budget alert from your Smart Expense Tracker.
        </p>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: userEmail,
      subject: `${alertStyle.icon} Budget Alert - ${alertType.replace("_", " ").toUpperCase()}`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Budget alert email failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendBulkUploadNotification(userEmail, userName, uploadData) {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Bulk upload notification (dev mode):", {
        to: userEmail,
        data: uploadData,
      })
      return { success: true, mode: "development" }
    }

    const { totalAmount, expenseCount, topCategories, budgetInfo, errorCount } = uploadData

    const categoriesHtml = topCategories
      .map(
        (cat) =>
          `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${cat.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${cat.total.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${cat.count}</td>
      </tr>`,
      )
      .join("")

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">📤 Bulk Upload Complete</h2>
        
        <p>Hi ${userName},</p>
        <p>Your CSV upload has been processed successfully!</p>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #0369a1;">Upload Summary</h3>
          <p><strong>Expenses Processed:</strong> ${expenseCount}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
          <p><strong>Average per Expense:</strong> ₹${expenseCount > 0 ? (totalAmount / expenseCount).toFixed(2) : "0.00"}</p>
          ${errorCount > 0 ? `<p style="color: #dc2626;"><strong>Errors:</strong> ${errorCount} rows had issues</p>` : ""}
        </div>

        ${
          topCategories.length > 0
            ? `
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Category Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Category</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Amount</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Count</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesHtml}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          budgetInfo && budgetInfo.alerts && budgetInfo.alerts.length > 0
            ? `
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Budget Alerts</h3>
          ${budgetInfo.alerts.map((alert) => `<p style="margin: 5px 0; color: #dc2626;">${alert.message}</p>`).join("")}
        </div>
        `
            : ""
        }

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated notification from your Smart Expense Tracker.
        </p>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: userEmail,
      subject: `📤 CSV Upload Complete - ${expenseCount} expenses processed`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Bulk upload email failed:", error)
      return { success: false, error: error.message }
    }
  }

  generateRecommendation(category, budgetInfo) {
    const { alerts, budgetLeft, monthlyBudget } = budgetInfo

    if (alerts.some((alert) => alert.type === "budget_exceeded")) {
      return "Consider reviewing your spending patterns and look for areas to cut back."
    }

    if (alerts.some((alert) => alert.type === "budget_warning")) {
      return "You're approaching your budget limit. Try to prioritize essential expenses only."
    }

    if (budgetLeft < monthlyBudget * 0.2 && monthlyBudget > 0) {
      return "You have limited budget remaining. Focus on necessary expenses."
    }

    const categoryTips = {
      Food: "Consider cooking at home more often to save on food expenses.",
      Transport: "Look into public transport or carpooling options to reduce transport costs.",
      Shopping: "Make a shopping list and stick to it to avoid impulse purchases.",
      Entertainment: "Look for free or low-cost entertainment alternatives.",
    }

    return categoryTips[category] || "Keep tracking your expenses to maintain good financial habits!"
  }

  // Split-related email functions
  async sendSplitNotification(participantEmail, splitData) {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Split notification email (dev mode):", {
        to: participantEmail,
        data: splitData,
      })
      return { success: true, mode: "development" }
    }

    const { 
      participantName, 
      creatorName, 
      splitTitle, 
      amount, 
      totalAmount, 
      description, 
      splitId 
    } = splitData

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💰 You're in a Split!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${participantName},</p>
          <p style="color: #4b5563; line-height: 1.6;">
            <strong>${creatorName}</strong> has added you to a split expense. Here are the details:
          </p>

          <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">${splitTitle}</h3>
            ${description ? `<p style="color: #6b7280; margin: 0 0 15px 0; font-style: italic;">"${description}"</p>` : ""}
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <div>
                <p style="margin: 5px 0; color: #374151;"><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Your Share:</strong> <span style="color: #dc2626; font-size: 24px; font-weight: bold;">₹${amount.toFixed(2)}</span></p>
              </div>
            </div>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">📋 What's Next?</h4>
            <p style="color: #92400e; margin: 0;">Please settle your share of ₹${amount.toFixed(2)} with ${creatorName}. Once paid, they can mark you as settled in the app.</p>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #15803d;">💡 Payment Tips</h4>
            <ul style="color: #15803d; margin: 10px 0; padding-left: 20px;">
              <li>Pay via UPI, bank transfer, or cash</li>
              <li>Include reference: "${splitTitle}" in payment description</li>
              <li>Confirm with ${creatorName} once payment is made</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${creatorName}?subject=Split Payment - ${splitTitle}&body=Hi ${creatorName}, I have paid my share of ₹${amount.toFixed(2)} for '${splitTitle}'. Please mark me as settled. Thanks!" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              Contact ${creatorName}
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              This split was created on ${new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: participantEmail,
      subject: `💰 Split Request: ₹${amount.toFixed(2)} - ${splitTitle}`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Split notification email failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendSplitReminderEmail(participantEmail, splitData) {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Split reminder email (dev mode):", {
        to: participantEmail,
        data: splitData,
      })
      return { success: true, mode: "development" }
    }

    const { 
      participantName, 
      creatorName, 
      splitTitle, 
      amount, 
      totalAmount, 
      description, 
      splitId,
      daysOverdue 
    } = splitData

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Payment Reminder</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${participantName},</p>
          <p style="color: #4b5563; line-height: 1.6;">
            This is a friendly reminder about your pending split payment to <strong>${creatorName}</strong>.
          </p>

          <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 20px;">${splitTitle}</h3>
            ${description ? `<p style="color: #92400e; margin: 0 0 15px 0; font-style: italic;">"${description}"</p>` : ""}
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <div>
                <p style="margin: 5px 0; color: #92400e;"><strong>Amount Due:</strong> <span style="color: #dc2626; font-size: 24px; font-weight: bold;">₹${amount.toFixed(2)}</span></p>
                <p style="margin: 5px 0; color: #92400e;"><strong>Days Pending:</strong> ${daysOverdue} days</p>
              </div>
            </div>
          </div>

          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626;">🚨 Action Required</h4>
            <p style="color: #dc2626; margin: 0;">
              Please settle your pending amount of ₹${amount.toFixed(2)} with ${creatorName} as soon as possible.
              ${daysOverdue > 7 ? " This payment is significantly overdue." : ""}
            </p>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #15803d;">💳 Quick Payment Options</h4>
            <ul style="color: #15803d; margin: 10px 0; padding-left: 20px;">
              <li><strong>UPI:</strong> Ask ${creatorName} for their UPI ID</li>
              <li><strong>Bank Transfer:</strong> Request account details</li>
              <li><strong>Cash:</strong> Arrange to meet in person</li>
              <li><strong>Digital Wallets:</strong> PayTM, PhonePe, Google Pay</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${creatorName}?subject=Split Payment - ${splitTitle}&body=Hi ${creatorName}, I saw the reminder for the split payment of ₹${amount.toFixed(2)} for '${splitTitle}'. I'll settle this soon. Thanks for the reminder!" 
               style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; margin-right: 15px;">
              Reply to ${creatorName}
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Split created ${daysOverdue} days ago • Keep your friendships strong with timely payments! 💪
            </p>
          </div>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: participantEmail,
      subject: `⏰ Payment Reminder: ₹${amount.toFixed(2)} - ${splitTitle} (${daysOverdue} days pending)`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Split reminder email failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendSplitSettledNotification(creatorEmail, splitData) {
    if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
      console.log("📧 Split settled notification (dev mode):", {
        to: creatorEmail,
        data: splitData,
      })
      return { success: true, mode: "development" }
    }

    const { 
      creatorName, 
      participantName, 
      splitTitle, 
      amount, 
      totalAmount 
    } = splitData

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Received!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${creatorName},</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Great news! <strong>${participantName}</strong> has been marked as paid for the split expense.
          </p>

          <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 20px;">${splitTitle}</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <div>
                <p style="margin: 5px 0; color: #065f46;"><strong>Amount Paid:</strong> <span style="color: #10b981; font-size: 24px; font-weight: bold;">₹${amount.toFixed(2)}</span></p>
                <p style="margin: 5px 0; color: #065f46;"><strong>Paid By:</strong> ${participantName}</p>
              </div>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">📊 Split Status Update</h4>
            <p style="color: #4b5563; margin: 0;">This participant has settled their portion. Check your app to see the updated split status and remaining participants.</p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Payment confirmed on ${new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: creatorEmail,
      subject: `✅ Payment Received: ₹${amount.toFixed(2)} from ${participantName}`,
      html: htmlContent,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Split settled notification email failed:", error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new MailService()

// Export specific functions for split functionality
module.exports.sendSplitNotification = async (email, data) => {
  const mailService = new MailService()
  return mailService.sendSplitNotification(email, data)
}

module.exports.sendSplitReminderEmail = async (email, data) => {
  const mailService = new MailService()
  return mailService.sendSplitReminderEmail(email, data)
}

module.exports.sendSplitSettledNotification = async (email, data) => {
  const mailService = new MailService()
  return mailService.sendSplitSettledNotification(email, data)
}
