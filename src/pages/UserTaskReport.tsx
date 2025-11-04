import React from 'react'
import { UserTaskReport } from '@/components/reports/UserTaskReport'

export default function UserTaskReportPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Task Summary</h1>
        <p className="text-muted-foreground mt-2">
          View your personal task performance and generate downloadable reports.
        </p>
      </div>
      
      <UserTaskReport />
    </div>
  )
}




