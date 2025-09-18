const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const crypto = require('crypto-js');
const User = require('../models/User');

class PersonalEmailService {
  constructor() {
    // Initialize Google OAuth2 client
    this.googleClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`
    );
  }

  // Decrypt tokens
  decryptToken(encryptedToken) {
    if (!encryptedToken) return null;
    try {
      const secret = process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-key-change-in-production';
      const bytes = crypto.AES.decrypt(encryptedToken, secret);
      return bytes.toString(crypto.enc.Utf8);
    } catch (error) {
      console.error('Token decryption failed:', error);
      return null;
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(user, provider) {
    const connection = user.emailConnections[provider];
    
    if (!connection.connected) {
      throw new Error(`${provider} is not connected`);
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(connection.tokenExpiry);
    
    if (now >= tokenExpiry) {
      // Token is expired, try to refresh
      return await this.refreshTokens(user, provider);
    }

    return this.decryptToken(connection.accessToken);
  }

  // Refresh expired tokens
  async refreshTokens(user, provider) {
    try {
      if (provider === 'gmail' && user.emailConnections.gmail.refreshToken) {
        const refreshToken = this.decryptToken(user.emailConnections.gmail.refreshToken);
        
        this.googleClient.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.googleClient.refreshAccessToken();
        
        const secret = process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-key-change-in-production';
        user.emailConnections.gmail.accessToken = crypto.AES.encrypt(credentials.access_token, secret).toString();
        user.emailConnections.gmail.tokenExpiry = new Date(credentials.expiry_date);
        
        if (credentials.refresh_token) {
          user.emailConnections.gmail.refreshToken = crypto.AES.encrypt(credentials.refresh_token, secret).toString();
        }
        
        await user.save();
        return credentials.access_token;
      } else if (provider === 'outlook' && user.emailConnections.outlook.refreshToken) {
        // Outlook token refresh would go here
        // For now, we'll mark as disconnected and require re-auth
        user.emailConnections.outlook.connected = false;
        await user.save();
        throw new Error('Outlook token expired, please reconnect');
      }
    } catch (error) {
      console.error(`Failed to refresh ${provider} token:`, error);
      user.emailConnections[provider].connected = false;
      await user.save();
      throw error;
    }
    
    return null;
  }

  // Send email via Gmail API
  async sendViaGmail(user, emailData) {
    try {
      const accessToken = await this.getValidAccessToken(user, 'gmail');
      
      this.googleClient.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.googleClient });

      // Create MIME message
      const message = this.createMimeMessage({
        from: user.emailConnections.gmail.email,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(message).toString('base64url')
        }
      });

      return {
        success: true,
        messageId: result.data.id,
        provider: 'gmail',
        fromEmail: user.emailConnections.gmail.email
      };
    } catch (error) {
      console.error('Gmail send failed:', error);
      
      // If token is invalid, try to refresh once
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        try {
          await this.refreshTokens(user, 'gmail');
          // Retry sending after token refresh
          return await this.sendViaGmail(user, emailData);
        } catch (refreshError) {
          throw new Error('Gmail authentication expired. Please reconnect your Gmail account.');
        }
      }
      
      throw error;
    }
  }

  // Send email via Outlook/Microsoft Graph API
  async sendViaOutlook(user, emailData) {
    try {
      const accessToken = await this.getValidAccessToken(user, 'outlook');

      const messagePayload = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: 'HTML',
            content: emailData.html
          },
          toRecipients: [
            {
              emailAddress: {
                address: emailData.to
              }
            }
          ],
          from: {
            emailAddress: {
              address: user.emailConnections.outlook.email
            }
          }
        }
      };

      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Outlook API error: ${error.error?.message || 'Unknown error'}`);
      }

      return {
        success: true,
        messageId: `outlook-${Date.now()}`, // Outlook doesn't return message ID
        provider: 'outlook',
        fromEmail: user.emailConnections.outlook.email
      };
    } catch (error) {
      console.error('Outlook send failed:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('expired')) {
        throw new Error('Outlook authentication expired. Please reconnect your Outlook account.');
      }
      
      throw error;
    }
  }

  // Send email using user's personal email configuration
  async sendViaUserEmail(user, emailData) {
    try {
      if (!user.personalEmailConfig?.isConfigured) {
        throw new Error('User email not configured');
      }

      const decryptedPassword = this.decryptToken(user.personalEmailConfig.appPassword);
      if (!decryptedPassword) {
        throw new Error('Failed to decrypt user email password');
      }

      const transporter = nodemailer.createTransporter({
        service: 'gmail', // Assuming Gmail for now
        auth: {
          user: user.personalEmailConfig.email,
          pass: decryptedPassword,
        },
      });

      const mailOptions = {
        from: `${user.name} <${user.personalEmailConfig.email}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        provider: 'user-email',
        fromEmail: user.personalEmailConfig.email,
        fromName: user.name
      };
    } catch (error) {
      console.error('User email send failed:', error);
      throw error;
    }
  }

  // Fallback to app domain with Reply-To header and user's email as sender name
  async sendViaApp(emailData, senderUser = null) {
    try {
      const transporter = nodemailer.createTransporter({
        service: process.env.MAIL_SERVICE || "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      // Use sender's name and email for better personalization
      const fromName = senderUser ? senderUser.name : 'Smart Expense Tracker';
      const replyToEmail = senderUser ? senderUser.email : (process.env.MAIL_FROM || process.env.MAIL_USER);
      const fromAddress = `${fromName} <${process.env.MAIL_FROM || process.env.MAIL_USER}>`;

      const mailOptions = {
        from: fromAddress,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        replyTo: replyToEmail
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        provider: 'app',
        fromEmail: process.env.MAIL_FROM || process.env.MAIL_USER,
        replyTo: replyToEmail,
        fromName: fromName
      };
    } catch (error) {
      console.error('App domain send failed:', error);
      throw error;
    }
  }

  // Main send method - chooses the best sending option
  async sendPersonalizedEmail(senderUserId, emailData) {
    try {
      // Skip sending in development unless explicitly enabled
      if (process.env.NODE_ENV === "development" && process.env.SEND_REAL_EMAILS !== "true") {
        console.log("📧 Personal email notification (dev mode):", {
          senderUserId,
          to: emailData.to,
          subject: emailData.subject,
          provider: 'development'
        });
        return { success: true, mode: "development", provider: 'development' };
      }

      const user = await User.findById(senderUserId);
      if (!user) {
        throw new Error('Sender user not found');
      }

      // Determine which email provider to use
      const { sendFromPersonalEmail, preferredProvider, fallbackToReplyTo } = user.emailPreferences;
      
      if (!sendFromPersonalEmail) {
        // User prefers to send from app domain, but with their name and reply-to
        return await this.sendViaApp(emailData, user);
      }

      // Try personal email providers in order of preference
      const providers = this.getProviderPriority(preferredProvider, user);
      
      for (const provider of providers) {
        try {
          if (provider === 'gmail' && user.emailConnections.gmail.connected) {
            return await this.sendViaGmail(user, emailData);
          } else if (provider === 'outlook' && user.emailConnections.outlook.connected) {
            return await this.sendViaOutlook(user, emailData);
          }
        } catch (error) {
          console.log(`Failed to send via ${provider}, trying next option:`, error.message);
          continue;
        }
      }

      // If all personal providers failed, fallback to app domain with user context
      console.log('All personal email providers failed, falling back to app domain with user context');
      return await this.sendViaApp(emailData, user);

    } catch (error) {
      console.error('Personalized email send completely failed:', error);
      throw error;
    }
  }

  // Get provider priority based on user preferences and availability
  getProviderPriority(preferredProvider, user) {
    const available = [];
    
    // Add preferred provider first if connected
    if (preferredProvider === 'gmail' && user.emailConnections.gmail.connected) {
      available.push('gmail');
    } else if (preferredProvider === 'outlook' && user.emailConnections.outlook.connected) {
      available.push('outlook');
    }

    // Add other available providers
    if (preferredProvider !== 'gmail' && user.emailConnections.gmail.connected) {
      available.push('gmail');
    }
    if (preferredProvider !== 'outlook' && user.emailConnections.outlook.connected) {
      available.push('outlook');
    }

    return available;
  }

  // Create MIME message for Gmail API
  createMimeMessage(options) {
    const { from, to, subject, html } = options;
    
    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\r\n');

    return message;
  }

  // Send split notification using personalized email
  async sendPersonalizedSplitNotification(creatorUserId, participantEmail, splitData) {
    const emailData = {
      to: participantEmail,
      subject: `💰 Split Request: ₹${splitData.amount.toFixed(2)} - ${splitData.splitTitle}`,
      html: this.generateSplitNotificationHTML(splitData)
    };

    const result = await this.sendPersonalizedEmail(creatorUserId, emailData);
    
    console.log(`📧 Split notification sent via ${result.provider} from ${result.fromEmail || result.replyTo} to ${participantEmail}`);
    
    return result;
  }

  // Send settlement notification using personalized email  
  async sendPersonalizedSettlementNotification(settlerUserId, creatorEmail, settlementData) {
    const emailData = {
      to: creatorEmail,
      subject: `✅ Payment Received: ₹${settlementData.amount.toFixed(2)} from ${settlementData.participantName}`,
      html: this.generateSettlementNotificationHTML(settlementData)
    };

    const result = await this.sendPersonalizedEmail(settlerUserId, emailData);
    
    console.log(`📧 Settlement notification sent via ${result.provider} from ${result.fromEmail || result.replyTo} to ${creatorEmail}`);
    
    return result;
  }

  // Send reminder using personalized email
  async sendPersonalizedReminder(creatorUserId, participantEmail, reminderData) {
    const emailData = {
      to: participantEmail,
      subject: `⏰ Payment Reminder: ₹${reminderData.amount.toFixed(2)} - ${reminderData.splitTitle} (${reminderData.daysOverdue} days pending)`,
      html: this.generateReminderHTML(reminderData)
    };

    const result = await this.sendPersonalizedEmail(creatorUserId, emailData);
    
    console.log(`📧 Reminder sent via ${result.provider} from ${result.fromEmail || result.replyTo} to ${participantEmail}`);
    
    return result;
  }

  // HTML Templates
  generateSplitNotificationHTML(splitData) {
    const { participantName, creatorName, splitTitle, amount, totalAmount, description } = splitData;
    
    return `
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

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              This split was created on ${new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • Sent on behalf of ${creatorName}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  generateSettlementNotificationHTML(settlementData) {
    const { creatorName, participantName, splitTitle, amount } = settlementData;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Received!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${creatorName},</p>
          <p style="color: #4b5563; line-height: 1.6;">
            Great news! <strong>${participantName}</strong> has settled their share for the split expense.
          </p>

          <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 20px;">${splitTitle}</h3>
            <div>
              <p style="margin: 5px 0; color: #065f46;"><strong>Amount Settled:</strong> <span style="color: #10b981; font-size: 24px; font-weight: bold;">₹${amount.toFixed(2)}</span></p>
              <p style="margin: 5px 0; color: #065f46;"><strong>Paid By:</strong> ${participantName}</p>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Payment confirmed on ${new Date().toLocaleDateString('en-IN')} • Notification sent on behalf of ${participantName}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  generateReminderHTML(reminderData) {
    const { participantName, creatorName, splitTitle, amount, daysOverdue, description } = reminderData;
    
    return `
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
            <div>
              <p style="margin: 5px 0; color: #92400e;"><strong>Amount Due:</strong> <span style="color: #dc2626; font-size: 24px; font-weight: bold;">₹${amount.toFixed(2)}</span></p>
              <p style="margin: 5px 0; color: #92400e;"><strong>Days Pending:</strong> ${daysOverdue} days</p>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Reminder sent from ${creatorName} • Please reply directly to settle payment • Keep friendships strong! 💪
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

module.exports = new PersonalEmailService();