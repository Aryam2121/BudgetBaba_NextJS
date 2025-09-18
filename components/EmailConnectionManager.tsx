"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { Mail, CheckCircle, XCircle, RefreshCw, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailConnectionManager() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await api.getEmailStatus()
      setStatus(res)
    } catch (e) {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const connectProvider = async (provider: "gmail" | "outlook") => {
    setLoading(true)
    try {
      const res = await api.getOAuthUrl(provider)
      if (res.authUrl) {
        window.location.href = res.authUrl
      }
    } catch (e) {
      toast({ title: "Error", description: `Failed to connect to ${provider}`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const disconnectProvider = async (provider: "gmail" | "outlook") => {
    setLoading(true)
    try {
      await api.disconnectEmailProvider(provider)
      toast({ title: "Disconnected", description: `${provider} disconnected successfully` })
      fetchStatus()
    } catch (e) {
      toast({ title: "Error", description: `Failed to disconnect ${provider}`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const renderProvider = (provider: "gmail" | "outlook") => {
    const conn = status?.[provider]
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <span className="font-medium capitalize">{provider}</span>
          {conn?.connected ? (
            <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Connected</Badge>
          ) : (
            <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" /> Not Connected</Badge>
          )}
          {conn?.email && <span className="text-xs text-gray-600 ml-2">{conn.email}</span>}
          {conn?.tokenExpired && <Badge variant="destructive" className="ml-2">Token Expired</Badge>}
        </div>
        <div className="flex gap-2">
          {conn?.connected ? (
            <Button size="sm" variant="outline" onClick={() => disconnectProvider(provider)} disabled={loading}>
              <LogOut className="h-4 w-4 mr-1" /> Disconnect
            </Button>
          ) : (
            <Button size="sm" variant="default" onClick={() => connectProvider(provider)} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1" /> Connect
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Account Connections</CardTitle>
        <CardDescription>
          Connect your Gmail or Outlook account to send split notifications from your own email address. You can disconnect at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderProvider("gmail")}
        {renderProvider("outlook")}
      </CardContent>
    </Card>
  )
}
