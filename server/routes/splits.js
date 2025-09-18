const express = require("express")
const { 
  createSplit, 
  getUserSplits, 
  markAsPaid, 
  sendReminder, 
  deleteSplit 
} = require("../controllers/splitController")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// Create a new split
router.post("/", createSplit)

// Get user's splits (created by them or they're a participant)
router.get("/", getUserSplits)

// Mark a participant as paid
router.patch("/:splitId/participants/:participantEmail/paid", markAsPaid)

// Send reminder email to participant
router.post("/:splitId/participants/:participantEmail/remind", sendReminder)

// Delete a split (only by creator)
router.delete("/:splitId", deleteSplit)

// Get specific split details
router.get("/:splitId", async (req, res) => {
  try {
    const { splitId } = req.params
    const userId = req.user._id

    const split = await require("../models/Split")
      .findById(splitId)
      .populate('expenseId')
      .populate('createdBy', 'name email')

    if (!split) {
      return res.status(404).json({ error: "Split not found" })
    }

    // Check if user has access to this split
    const hasAccess = 
      split.createdBy._id.toString() === userId.toString() ||
      split.participants.some(p => 
        (p.userId && p.userId.toString() === userId.toString()) || 
        p.email === req.user.email
      )

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Add user-specific data
    const userParticipant = split.participants.find(p => 
      (p.userId && p.userId.toString() === userId.toString()) || 
      p.email === req.user.email
    )

    const splitWithUserData = {
      ...split.toObject(),
      userAmount: userParticipant ? userParticipant.amount : 0,
      userPaid: userParticipant ? userParticipant.isPaid : false,
      isCreator: split.createdBy._id.toString() === userId.toString(),
    }

    res.json({ split: splitWithUserData })
  } catch (error) {
    console.error("Get split details error:", error)
    res.status(500).json({ error: "Failed to get split details" })
  }
})

module.exports = router
