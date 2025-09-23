"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  Plus,
  Users,
  Edit,
  Trash2,
  UserPlus,
  DollarSign,
  Calendar,
  Settings,
  Mail,
  Copy,
  ExternalLink,
  Crown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Share2
} from 'lucide-react'

interface GroupMember {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
  totalOwed: number
  totalOwes: number
}

interface Group {
  id: string
  name: string
  description: string
  code: string
  createdBy: string
  createdAt: string
  members: GroupMember[]
  totalExpenses: number
  totalSplits: number
  isActive: boolean
  settings: {
    autoApprove: boolean
    currency: string
    allowNonMembers: boolean
  }
}

export default function GroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-groups')
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    autoApprove: true,
    currency: 'USD',
    allowNonMembers: false
  })
  const [inviteEmails, setInviteEmails] = useState('')

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  const loadGroups = async () => {
    try {
      setLoading(true)
      
      // Get splits data to simulate groups
      const response = await api.getSplits()
      
      if (response.data && response.data.length > 0) {
        // Transform splits data into groups
        const groupsMap = new Map<string, any>()
        
        response.data.forEach((split: any) => {
          const groupName = split.description || 'Default Group'
          const groupId = groupName.toLowerCase().replace(/\s+/g, '-')
          
          if (!groupsMap.has(groupId)) {
            groupsMap.set(groupId, {
              id: groupId,
              name: groupName,
              description: `Group for managing expenses related to ${groupName}`,
              code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              createdBy: user?.id || 'current-user',
              createdAt: new Date().toISOString(),
              members: [],
              totalExpenses: 0,
              totalSplits: 0,
              isActive: true,
              settings: {
                autoApprove: true,
                currency: 'USD',
                allowNonMembers: false
              }
            })
          }
          
          const group = groupsMap.get(groupId)
          group.totalExpenses += split.totalAmount || 0
          group.totalSplits += 1
          
          // Add participants as members
          if (split.participants) {
            split.participants.forEach((participant: any) => {
              const existingMember = group.members.find((m: any) => m.email === participant.email)
              if (!existingMember) {
                group.members.push({
                  id: participant.userId || Math.random().toString(36).substring(2, 9),
                  email: participant.email,
                  name: participant.name || participant.email.split('@')[0],
                  role: participant.email === user?.email ? 'admin' : 'member',
                  status: 'active',
                  joinedAt: new Date().toISOString(),
                  totalOwed: participant.amountOwed || 0,
                  totalOwes: participant.amountOwes || 0
                })
              } else {
                existingMember.totalOwed += participant.amountOwed || 0
                existingMember.totalOwes += participant.amountOwes || 0
              }
            })
          }
        })
        
        setGroups(Array.from(groupsMap.values()))
      } else {
        // Create sample groups if no data
        setGroups([
          {
            id: 'family-group',
            name: 'Family Expenses',
            description: 'Shared family expenses and bills',
            code: 'FAM123',
            createdBy: user?.id || 'current-user',
            createdAt: new Date().toISOString(),
            members: [
              {
                id: 'user-1',
                email: user?.email || 'user@example.com',
                name: user?.name || 'You',
                role: 'admin',
                status: 'active',
                joinedAt: new Date().toISOString(),
                totalOwed: 150.00,
                totalOwes: 75.50
              }
            ],
            totalExpenses: 1250.75,
            totalSplits: 12,
            isActive: true,
            settings: {
              autoApprove: true,
              currency: 'USD',
              allowNonMembers: false
            }
          }
        ])
      }
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error('Failed to load groups')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const groupData: Group = {
        id: editingGroup?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        code: editingGroup?.code || Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdBy: user?.id || 'current-user',
        createdAt: editingGroup?.createdAt || new Date().toISOString(),
        members: editingGroup?.members || [
          {
            id: user?.id || 'current-user',
            email: user?.email || '',
            name: user?.name || 'You',
            role: 'admin',
            status: 'active',
            joinedAt: new Date().toISOString(),
            totalOwed: 0,
            totalOwes: 0
          }
        ],
        totalExpenses: editingGroup?.totalExpenses || 0,
        totalSplits: editingGroup?.totalSplits || 0,
        isActive: true,
        settings: {
          autoApprove: formData.autoApprove,
          currency: formData.currency,
          allowNonMembers: formData.allowNonMembers
        }
      }

      if (editingGroup) {
        setGroups(prev => prev.map(group => 
          group.id === editingGroup.id ? groupData : group
        ))
        toast.success('Group updated successfully')
      } else {
        setGroups(prev => [...prev, groupData])
        toast.success('Group created successfully')
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Failed to save group')
    }
  }

  const handleInvite = async () => {
    if (!selectedGroup || !inviteEmails.trim()) return
    
    try {
      const emails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean)
      
      // Add new members to the group
      const newMembers = emails.map(email => ({
        id: Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0],
        role: 'member' as const,
        status: 'pending' as const,
        joinedAt: new Date().toISOString(),
        totalOwed: 0,
        totalOwes: 0
      }))

      setGroups(prev => prev.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, members: [...group.members, ...newMembers] }
          : group
      ))

      toast.success(`Invited ${emails.length} member(s) to ${selectedGroup.name}`)
      setInviteEmails('')
      setInviteDialogOpen(false)
      setSelectedGroup(null)
    } catch (error) {
      toast.error('Failed to send invitations')
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
      autoApprove: group.settings.autoApprove,
      currency: group.settings.currency,
      allowNonMembers: group.settings.allowNonMembers
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId))
    toast.success('Group deleted successfully')
  }

  const resetForm = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      description: '',
      autoApprove: true,
      currency: 'USD',
      allowNonMembers: false
    })
  }

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Group code copied to clipboard')
  }

  const totalGroups = groups.length
  const activeGroups = groups.filter(g => g.isActive).length
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0)
  const totalExpenses = groups.reduce((sum, group) => sum + group.totalExpenses, 0)

  const myGroups = groups.filter(group => 
    group.members.some(member => member.email === user?.email)
  )
  const adminGroups = groups.filter(group => 
    group.members.some(member => member.email === user?.email && member.role === 'admin')
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Group Management</h1>
              <p className="text-slate-600 mt-1">
                Create and manage expense sharing groups
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGroup ? 'Edit Group' : 'Create New Group'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGroup ? 'Update group settings and details' : 'Create a new group to share expenses with friends and family'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Family Expenses, Roommate Bills"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what expenses this group will track"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-md"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoApprove">Auto-approve expenses</Label>
                      <input
                        type="checkbox"
                        id="autoApprove"
                        checked={formData.autoApprove}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoApprove: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowNonMembers">Allow non-member participation</Label>
                      <input
                        type="checkbox"
                        id="allowNonMembers"
                        checked={formData.allowNonMembers}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowNonMembers: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingGroup ? 'Update Group' : 'Create Group'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Groups</p>
                    <p className="text-2xl font-bold text-slate-800">{totalGroups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Active Groups</p>
                    <p className="text-2xl font-bold text-slate-800">{activeGroups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserPlus className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Members</p>
                    <p className="text-2xl font-bold text-slate-800">{totalMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Shared</p>
                    <p className="text-2xl font-bold text-slate-800">${totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Groups Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
              <TabsTrigger value="admin-groups">Admin Groups ({adminGroups.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="my-groups" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>My Groups</CardTitle>
                  <CardDescription>
                    Groups you're a member of
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-slate-200 rounded-full" />
                              <div>
                                <div className="h-4 bg-slate-200 rounded w-32 mb-1" />
                                <div className="h-3 bg-slate-200 rounded w-24" />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-8 bg-slate-200 rounded" />
                            <div className="h-8 bg-slate-200 rounded" />
                            <div className="h-8 bg-slate-200 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : myGroups.length > 0 ? (
                    <div className="space-y-4">
                      {myGroups.map((group) => (
                        <Card key={group.id} className="border-slate-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800 flex items-center">
                                    {group.name}
                                    {group.members.find(m => m.email === user?.email)?.role === 'admin' && (
                                      <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                                    )}
                                  </h3>
                                  <p className="text-sm text-slate-600">{group.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyGroupCode(group.code)}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  {group.code}
                                </Button>
                                
                                {group.members.find(m => m.email === user?.email)?.role === 'admin' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedGroup(group)
                                        setInviteDialogOpen(true)
                                      }}
                                    >
                                      <UserPlus className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(group)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(group.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800">{group.members.length}</div>
                                <div className="text-sm text-slate-600">Members</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800">${group.totalExpenses.toFixed(2)}</div>
                                <div className="text-sm text-slate-600">Total Expenses</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800">{group.totalSplits}</div>
                                <div className="text-sm text-slate-600">Splits</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-sm font-medium text-slate-600">Members:</span>
                              {group.members.slice(0, 5).map((member, index) => (
                                <div key={member.id} className="flex items-center space-x-1">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      {member.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <Badge 
                                    variant={member.status === 'active' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {member.name}
                                    {member.role === 'admin' && <Crown className="h-3 w-3 ml-1" />}
                                  </Badge>
                                </div>
                              ))}
                              {group.members.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{group.members.length - 5} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-xs text-slate-500">
                              Created {new Date(group.createdAt).toLocaleDateString()} • 
                              Currency: {group.settings.currency}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No groups yet</h3>
                      <p className="text-slate-500">Create your first group to start sharing expenses</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin-groups" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Groups I Manage</CardTitle>
                  <CardDescription>
                    Groups where you have admin privileges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminGroups.length > 0 ? (
                    <div className="space-y-4">
                      {adminGroups.map((group) => (
                        <Card key={group.id} className="border-slate-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                  <Crown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{group.name}</h3>
                                  <p className="text-sm text-slate-600">{group.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedGroup(group)
                                    setInviteDialogOpen(true)
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Invite
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(group)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-xl font-bold text-slate-800">{group.members.length}</div>
                                <div className="text-xs text-slate-600">Members</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-slate-800">
                                  {group.members.filter(m => m.status === 'pending').length}
                                </div>
                                <div className="text-xs text-slate-600">Pending</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-slate-800">${group.totalExpenses.toFixed(2)}</div>
                                <div className="text-xs text-slate-600">Total</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-slate-800">{group.totalSplits}</div>
                                <div className="text-xs text-slate-600">Splits</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No admin groups</h3>
                      <p className="text-slate-500">Create a group to become an admin</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Invite Members Dialog */}
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Members</DialogTitle>
                <DialogDescription>
                  Invite people to join {selectedGroup?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Group Code:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyGroupCode(selectedGroup?.code || '')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {selectedGroup?.code}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Share this code for people to join the group
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Addresses</Label>
                  <Textarea
                    id="emails"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    placeholder="Enter email addresses separated by commas..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    Enter multiple emails separated by commas
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmails.trim()}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitations
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}