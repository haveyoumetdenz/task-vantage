import React from 'react'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { OrganizationReport } from '@/components/reports/OrganizationReport'

export default function OrganizationReports() {
  const { isHR, isSeniorManagement } = useFirebaseRBAC()

  // Check if user has permission to view organization reports
  if (!isHR && !isSeniorManagement) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view organization-wide reports. 
            Only HR and Senior Management can access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Organization Reports</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze organization-wide performance metrics and generate reports.
        </p>
      </div>
      
      <OrganizationReport />
    </div>
  )
}







