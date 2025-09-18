const Split = require("../models/Split")
const Expense = require("../models/Expense")
const User = require("../models/User")
const personalEmailService = require("../utils/personalEmailService")

// Create a new split
const createSplit = async (req, res) => {
  try {
    const { expenseId, title, description, participants, splitType = "equal" } = req.body
    const userId = req.user._id

    // Validate expense exists and belongs to user
    const expense = await Expense.findOne({ _id: expenseId, userId })
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" })
    }

    if (expense.isSplit) {
      return res.status(400).json({ error: "This expense is already split" })
    }

    // Validate participants
    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: "At least one participant is required" })
    }

    // Calculate split amounts based on type
    let calculatedParticipants = []
    const totalAmount = expense.amount

    if (splitType === "equal") {
      const splitAmount = totalAmount / (participants.length + 1) // +1 for the creator
      
      // Add creator as participant
      calculatedParticipants.push({
        userId: userId,
        email: req.user.email,
        name: req.user.name,
        amount: splitAmount,
        isPaid: true, // Creator already paid
        paidAt: new Date(),
      })

      // Add other participants
      participants.forEach(participant => {
        calculatedParticipants.push({
          userId: participant.userId || null,
          email: participant.email,
          name: participant.name,
          amount: splitAmount,
          isPaid: false,
        })
      })
    } else if (splitType === "exact") {
      // Validate that amounts add up to total
      const participantTotal = participants.reduce((sum, p) => sum + p.amount, 0)
      if (Math.abs(participantTotal + (req.body.creatorAmount || 0) - totalAmount) > 0.01) {
        return res.status(400).json({ error: "Split amounts don't add up to total amount" })
      }

      calculatedParticipants.push({
        userId: userId,
        email: req.user.email,
        name: req.user.name,
        amount: req.body.creatorAmount || 0,
        isPaid: true,
        paidAt: new Date(),
      })

      participants.forEach(participant => {
        calculatedParticipants.push({
          userId: participant.userId || null,
          email: participant.email,
          name: participant.name,
          amount: participant.amount,
          isPaid: false,
        })
      })
    } else if (splitType === "percentage") {
      // Validate percentages add up to 100
      const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0) + (req.body.creatorPercentage || 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({ error: "Percentages must add up to 100%" })
      }

      calculatedParticipants.push({
        userId: userId,
        email: req.user.email,
        name: req.user.name,
        amount: (totalAmount * (req.body.creatorPercentage || 0)) / 100,
        isPaid: true,
        paidAt: new Date(),
      })

      participants.forEach(participant => {
        calculatedParticipants.push({
          userId: participant.userId || null,
          email: participant.email,
          name: participant.name,
          amount: (totalAmount * participant.percentage) / 100,
          isPaid: false,
        })
      })
    }

    // Create split
    const split = new Split({
      expenseId,
      createdBy: userId,
      title: title || `${expense.vendor || 'Expense'} - ${expense.category}`,
      description: description || expense.note,
      totalAmount,
      splitType,
      participants: calculatedParticipants,
    })

    await split.save()

    // Update expense to mark as split
    expense.isSplit = true
    expense.splitId = split._id
    await expense.save()

    // Send email notifications to participants using personal email service
    const participantsToNotify = calculatedParticipants.filter(p => !p.isPaid && p.email !== req.user.email)
    console.log(`📧 Preparing to send personalized split notifications to ${participantsToNotify.length} participants...`)
    
    for (const [index, participant] of participantsToNotify.entries()) {
      try {
        console.log(`📤 Sending personalized email ${index + 1}/${participantsToNotify.length} to ${participant.email} (Amount: ₹${participant.amount.toFixed(2)})`)
        
        const result = await personalEmailService.sendPersonalizedSplitNotification(userId, participant.email, {
          participantName: participant.name,
          creatorName: req.user.name,
          splitTitle: split.title,
          amount: participant.amount,
          totalAmount: split.totalAmount,
          description: split.description,
          splitId: split._id,
        })
        
        if (result && result.success) {
          console.log(`✅ Email successfully sent to ${participant.email} via ${result.provider}`)
          if (result.mode === 'development') {
            console.log(`   📝 Development mode - Check console for email content`)
          } else if (result.messageId) {
            console.log(`   📧 Email Message ID: ${result.messageId}`)
          }
        } else {
          console.log(`❌ Failed to send email to ${participant.email}: ${result?.error || 'Unknown error'}`)
        }
        
        // Update participant with email status and provider info
        const participantIndex = split.participants.findIndex(p => p.email === participant.email)
        if (participantIndex !== -1) {
          split.participants[participantIndex].emailSent = result && result.success
          split.participants[participantIndex].emailSentAt = new Date()
          split.participants[participantIndex].emailProvider = result?.provider
          split.participants[participantIndex].emailFrom = result?.fromEmail || result?.replyTo
        }
      } catch (emailError) {
        console.error(`💥 Exception while sending email to ${participant.email}:`, emailError)
        
        // Mark email as failed
        const participantIndex = split.participants.findIndex(p => p.email === participant.email)
        if (participantIndex !== -1) {
          split.participants[participantIndex].emailSent = false
        }
      }
    }

    // Update split notification tracking
    split.emailNotifications.createdNotificationSent = participantsToNotify.length > 0
    if (participantsToNotify.length > 0) {
      // Use the first successful result for tracking
      const firstResult = participantsToNotify.length > 0 ? 'app' : null // Fallback
      split.emailNotifications.createdEmailProvider = firstResult
      split.emailNotifications.createdEmailFrom = req.user.email
    }

    await split.save()

    // Emit real-time update via Socket.IO
    const io = req.app.get('socketio')
    if (io) {
      // Notify all participants about the new split
      calculatedParticipants.forEach(participant => {
        if (participant.userId) {
          io.to(`user-${participant.userId}`).emit('split-created', {
            splitId: split._id,
            title: split.title,
            amount: participant.amount,
            creatorName: req.user.name
          })
        }
      })
      
      // Notify creator
      io.to(`user-${userId}`).emit('split-created', {
        splitId: split._id,
        title: split.title,
        participantCount: calculatedParticipants.length - 1,
        emailsSent: participantsToNotify.filter(p => split.participants.find(sp => sp.email === p.email)?.emailSent).length
      })
    }

    // Populate the split for response
    const populatedSplit = await Split.findById(split._id)
      .populate('expenseId')
      .populate('createdBy', 'name email')

    res.status(201).json({
      message: "Split created successfully",
      split: populatedSplit,
    })
  } catch (error) {
    console.error("Create split error:", error)
    res.status(500).json({ error: "Failed to create split" })
  }
}

// Get user's splits
const getUserSplits = async (req, res) => {
  try {
    const userId = req.user._id
    const { status, type } = req.query

    // Build query
    let query = {
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId },
        { 'participants.email': req.user.email }
      ]
    }

    if (status === 'settled') {
      query.isSettled = true
    } else if (status === 'unsettled') {
      query.isSettled = false
    }

    const splits = await Split.find(query)
      .populate('expenseId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    // Calculate summary for each split
    const splitsWithSummary = splits.map(split => {
      const userParticipant = split.participants.find(p => 
        (p.userId && p.userId.toString() === userId.toString()) || 
        p.email === req.user.email
      )

      const totalOwed = split.participants
        .filter(p => !p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0)

      const totalPaid = split.participants
        .filter(p => p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        ...split.toObject(),
        userAmount: userParticipant ? userParticipant.amount : 0,
        userPaid: userParticipant ? userParticipant.isPaid : false,
        totalOwed,
        totalPaid,
        isCreator: split.createdBy._id.toString() === userId.toString(),
      }
    })

    res.json({
      splits: splitsWithSummary,
      summary: {
        total: splitsWithSummary.length,
        settled: splitsWithSummary.filter(s => s.isSettled).length,
        unsettled: splitsWithSummary.filter(s => !s.isSettled).length,
      }
    })
  } catch (error) {
    console.error("Get splits error:", error)
    res.status(500).json({ error: "Failed to get splits" })
  }
}

// Mark split participant as paid
const markAsPaid = async (req, res) => {
  try {
    const { splitId, participantEmail } = req.params
    const userId = req.user._id

    const split = await Split.findById(splitId)
    if (!split) {
      return res.status(404).json({ error: "Split not found" })
    }

    // Find participant
    const participant = split.participants.find(p => p.email === participantEmail)
    if (!participant) {
      return res.status(404).json({ error: "Participant not found in this split" })
    }

    // Only creator or the participant themselves can mark as paid
    const isCreator = split.createdBy.toString() === userId.toString()
    const isParticipant = participant.userId && participant.userId.toString() === userId.toString()
    const isParticipantEmail = participant.email === req.user.email

    if (!isCreator && !isParticipant && !isParticipantEmail) {
      return res.status(403).json({ error: "Not authorized to update this participant" })
    }

    // Mark as paid
    participant.isPaid = true
    participant.paidAt = new Date()

    // Check if all participants are paid
    const allPaid = split.participants.every(p => p.isPaid)
    if (allPaid && !split.isSettled) {
      split.isSettled = true
      split.settledAt = new Date()
    }

    await split.save()

    // Emit real-time update via Socket.IO
    const io = req.app.get('socketio')
    if (io) {
      // Notify all participants in the split
      split.participants.forEach(participant => {
        if (participant.userId) {
          io.to(`user-${participant.userId}`).emit('split-updated', {
            splitId: split._id,
            participantEmail: participantEmail,
            isPaid: true,
            paidAt: new Date(),
            isSettled: split.isSettled
          })
        }
      })
      
      // Notify creator
      io.to(`user-${split.createdBy}`).emit('split-updated', {
        splitId: split._id,
        participantEmail: participantEmail,
        isPaid: true,
        paidAt: new Date(),
        isSettled: split.isSettled
      })
      
      // Notify split-specific room
      io.to(`split-${splitId}`).emit('participant-paid', {
        participantEmail,
        isPaid: true,
        paidAt: new Date(),
        isSettled: split.isSettled
      })
    }

    res.json({
      message: "Marked as paid successfully",
      split,
      isSettled: split.isSettled,
    })
  } catch (error) {
    console.error("Mark as paid error:", error)
    res.status(500).json({ error: "Failed to update payment status" })
  }
}

// Send reminder email
const sendReminder = async (req, res) => {
  try {
    const { splitId, participantEmail } = req.params
    const userId = req.user._id

    const split = await Split.findById(splitId).populate('createdBy', 'name email')
    if (!split) {
      return res.status(404).json({ error: "Split not found" })
    }

    // Only creator can send reminders
    if (split.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only the split creator can send reminders" })
    }

    const participant = split.participants.find(p => p.email === participantEmail)
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" })
    }

    if (participant.isPaid) {
      return res.status(400).json({ error: "Participant has already paid" })
    }

    // Send reminder email using personal email service
    try {
      await personalEmailService.sendPersonalizedReminder(userId, participant.email, {
        participantName: participant.name,
        creatorName: split.createdBy.name,
        splitTitle: split.title,
        amount: participant.amount,
        totalAmount: split.totalAmount,
        description: split.description,
        splitId: split._id,
        daysOverdue: Math.floor((Date.now() - split.createdAt) / (1000 * 60 * 60 * 24)),
      })

      // Track reminder in split notifications
      if (!split.emailNotifications.remindersSent) {
        split.emailNotifications.remindersSent = []
      }
      split.emailNotifications.remindersSent.push({
        participantEmail: participant.email,
        sentAt: new Date(),
        provider: 'app', // Will be updated by personal email service
        fromEmail: split.createdBy.email
      })
      
      await split.save()

      res.json({ message: "Reminder sent successfully" })
    } catch (error) {
      console.error("Send reminder error:", error)
      res.status(500).json({ error: "Failed to send reminder" })
    }
  } catch (error) {
    console.error("Send reminder error:", error)
    res.status(500).json({ error: "Failed to send reminder" })
  }
}

// Delete split
const deleteSplit = async (req, res) => {
  try {
    const { splitId } = req.params
    const userId = req.user._id

    const split = await Split.findById(splitId)
    if (!split) {
      return res.status(404).json({ error: "Split not found" })
    }

    // Only creator can delete split
    if (split.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only the split creator can delete this split" })
    }

    // Update expense to remove split
    await Expense.findByIdAndUpdate(split.expenseId, {
      isSplit: false,
      $unset: { splitId: 1 }
    })

    // Delete split
    await Split.findByIdAndDelete(splitId)

    res.json({ message: "Split deleted successfully" })
  } catch (error) {
    console.error("Delete split error:", error)
    res.status(500).json({ error: "Failed to delete split" })
  }
}

module.exports = {
  createSplit,
  getUserSplits,
  markAsPaid,
  sendReminder,
  deleteSplit,
}
