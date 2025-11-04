import React from 'react'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { TeamPerformanceReport } from '@/components/reports/TeamPerformanceReport'

export default function TeamReports() {
  const { isManager, isDirector, isSeniorManagement } = useFirebaseRBAC()

  // Check if user has permission to view team reports
  if (!isManager && !isDirector && !isSeniorManagement) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view team performance reports. 
            Only managers, directors, and senior management can access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Team Performance Reports</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze team performance metrics and generate reports.
        </p>
      </div>
      
      <TeamPerformanceReport />
    </div>
  )
}







