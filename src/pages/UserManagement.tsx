import React, { useState, useEffect } from 'react'
import { Search, UserX, UserCheck, Trash2, MoreHorizontal, Shield, Users, UserPlus } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AccountManagementDialog } from '@/components/admin/AccountManagementDialog'
import { InviteUserDialog } from '@/components/admin/InviteUserDialog'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { db } from '@/integrations/firebase/client'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  teamId: string
  teamName?: string
  isActive: boolean
  createdAt: any
  deactivatedAt?: any
  deactivationReason?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const { profile } = useFirebaseProfile()
  const { isHR, isSeniorManagement, isManager } = useFirebaseRBAC()

  // Check if user has permission to access this page
  const hasPermission = isHR || isSeniorManagement

  // Load users from Firebase
  useEffect(() => {
    if (!hasPermission) return

    const usersRef = collection(db, 'profiles')
    // Remove orderBy for now to avoid issues with missing createdAt fields
    const q = query(usersRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let usersData = snapshot.docs.map(doc => {
        const data = doc.data()
        
        // Debug: Log raw data for each user
        console.log('🔍 Raw user data for', doc.id, ':', data)
        
        // Safe date handling
        let createdAt: Date
        let deactivatedAt: Date | undefined
        
        try {
          // Handle createdAt
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate()
          } else if (data.createdAt) {
            createdAt = new Date(data.createdAt)
          } else {
            createdAt = new Date() // Default to now
          }
        } catch (error) {
          console.warn('Error parsing createdAt for user:', doc.id, error)
          createdAt = new Date()
        }
        
        try {
          // Handle deactivatedAt
          if (data.deactivatedAt && typeof data.deactivatedAt.toDate === 'function') {
            deactivatedAt = data.deactivatedAt.toDate()
          } else if (data.deactivatedAt) {
            deactivatedAt = new Date(data.deactivatedAt)
          } else {
            deactivatedAt = undefined
          }
        } catch (error) {
          console.warn('Error parsing deactivatedAt for user:', doc.id, error)
          deactivatedAt = undefined
        }
        
        // Map team name based on teamId
        let teamName = 'No Team'
        if (data.teamId) {
          switch (data.teamId) {
            case 'hr':
              teamName = 'HR'
              break
            case 'engineering-1':
              teamName = 'Engineering 1'
              break
            case 'engineering-2':
              teamName = 'Engineering 2'
              break
            default:
              teamName = data.teamId
          }
        }
        
        // Determine if user is active (default to true if not set)
        const isActive = data.isActive !== false && !data.deactivatedAt
        
        const userData = {
          id: doc.id,
          email: data.email || '',
          fullName: data.fullName || data.displayName || 'Unknown',
          role: data.role || 'Staff',
          teamId: data.teamId || '',
          teamName: teamName,
          isActive: isActive,
          createdAt,
          deactivatedAt,
          deactivationReason: data.deactivationReason || '',
        }
        
        console.log('🔍 Processed user data:', userData)
        return userData
      }) as User[]

      // HR and Senior Management can see all users (no filtering needed)

      // Sort by createdAt (newest first)
      usersData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })

      setUsers(usersData)
      setLoading(false)
    }, (error) => {
      console.error('Error loading users:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [hasPermission])

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchTerm])

  const handleAccountAction = (user: User) => {
    setSelectedUser(user)
    setShowAccountDialog(true)
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Deactivated</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      'Staff': 'bg-blue-100 text-blue-800',
      'Manager': 'bg-green-100 text-green-800',
      'Director': 'bg-purple-100 text-purple-800',
      'Senior Management': 'bg-yellow-100 text-yellow-800',
      'HR': 'bg-pink-100 text-pink-800',
    }
    
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    )
  }

  // Check if user has permission to access this page
  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access user management. This page is restricted to HR and Senior Management only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>
            Search and filter users by name, email, or role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {user.teamName || 'No Team'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(user.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAccountAction(user)}>
                          <UserX className="h-4 w-4 mr-2" />
                          Manage Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Account Management Dialog */}
      {selectedUser && (
        <AccountManagementDialog
          open={showAccountDialog}
          onOpenChange={setShowAccountDialog}
          targetUserId={selectedUser.id}
          targetUserName={selectedUser.fullName}
          targetUserEmail={selectedUser.email}
        />
      )}

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  )
}
