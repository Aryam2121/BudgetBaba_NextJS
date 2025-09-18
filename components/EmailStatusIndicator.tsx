"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EmailStatusIndicatorProps {
  emailSent?: boolean
  emailSentAt?: string
  participantEmail: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function EmailStatusIndicator({ 
  emailSent, 
  emailSentAt, 
  participantEmail, 
  showLabel = false,
  size = 'sm'
}: EmailStatusIndicatorProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
  
  const getStatus = () => {
    if (emailSent === undefined) {
      return {
        icon: <Clock className={`${iconSize} text-gray-400`} />,
        label: 'Pending',
        variant: 'secondary' as const,
        tooltip: 'Email notification pending'
      }
    }
    
    if (emailSent) {
      return {
        icon: <CheckCircle className={`${iconSize} text-green-600`} />,
        label: 'Sent',
        variant: 'default' as const,
        tooltip: `Email sent to ${participantEmail}${emailSentAt ? ` on ${new Date(emailSentAt).toLocaleString()}` : ''}`
      }
    }
    
    return {
      icon: <XCircle className={`${iconSize} text-red-600`} />,
      label: 'Failed',
      variant: 'destructive' as const,
      tooltip: `Failed to send email to ${participantEmail}`
    }
  }

  const status = getStatus()

  const content = (
    <div className="flex items-center space-x-1">
      {status.icon}
      {showLabel && (
        <span className={`text-xs ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        }`}>
          {status.label}
        </span>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {showLabel ? (
            <Badge variant={status.variant} className="cursor-help">
              {content}
            </Badge>
          ) : (
            <div className="cursor-help">
              {content}
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Email Status Summary Component
interface EmailStatusSummaryProps {
  participants: Array<{
    email: string
    name: string
    emailSent?: boolean
    emailSentAt?: string
    emailProvider?: string
    emailFrom?: string
  }>
  creatorName?: string
}

export function EmailStatusSummary({ participants, creatorName }: EmailStatusSummaryProps) {
  const emailStats = participants.reduce(
    (acc, p) => {
      if (p.emailSent === true) acc.sent++
      else if (p.emailSent === false) acc.failed++
      else acc.pending++
      return acc
    },
    { sent: 0, failed: 0, pending: 0 }
  )

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Mail className="h-4 w-4 text-blue-600" />
          <span className="font-medium">Email Status:</span>
        </div>
        
        {emailStats.sent > 0 && (
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-green-600">{emailStats.sent} sent</span>
          </div>
        )}
        
        {emailStats.failed > 0 && (
          <div className="flex items-center space-x-1">
            <XCircle className="h-3 w-3 text-red-600" />
            <span className="text-red-600">{emailStats.failed} failed</span>
          </div>
        )}
        
        {emailStats.pending > 0 && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">{emailStats.pending} pending</span>
          </div>
        )}
      </div>

      {creatorName && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span>Sent by: {creatorName}</span>
        </div>
      )}
    </div>
  )
}
