import jsPDF from 'jspdf'
import { format } from 'date-fns'

// Simple Team Performance Report
export const generateTeamPerformanceReportPDF = (reportData: any) => {
  const doc = new jsPDF()
  const pageHeight = 297 // A4 page height in mm
  const margin = 20
  const lineHeight = 12
  
  // Simple header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Team Performance Report', margin, 30)
  
  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 40)
  
  let currentY = 60
  
  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage()
      currentY = 20
      return true
    }
    return false
  }
  
  // Basic team overview
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Team Overview', margin, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Team Members: ${reportData.totalMembers || 0}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Overall Completion Rate: ${reportData.overallCompletionRate || 0}%`, margin, currentY)
  currentY += lineHeight
  doc.text(`Average Task Time: ${reportData.averageTaskTime || 0} days`, margin, currentY)
  currentY += 20
  
  // Individual member performance
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Individual Performance', margin, currentY)
  currentY += 15
  
  const members = reportData.members || []
  members.forEach((member: any, index: number) => {
    // Check if we need a new page for each member
    checkPageBreak(40)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${member.name || 'N/A'} (${member.role || 'N/A'})`, margin, currentY)
    currentY += 8
    doc.text(`  • Completed: ${member.tasksCompleted || 0} tasks`, margin + 5, currentY)
    currentY += 8
    doc.text(`  • Completion Rate: ${member.completionRate || 0}%`, margin + 5, currentY)
    currentY += 8
    doc.text(`  • Average Time: ${member.averageTime || 0} days`, margin + 5, currentY)
    currentY += 12
  })
  
  // Team statistics
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Team Statistics', margin, currentY)
  currentY += 15
  
  const totalTasks = members.reduce((sum: number, member: any) => sum + (member.tasksCompleted || 0), 0)
  const totalOverdue = members.reduce((sum: number, member: any) => sum + (member.overdueTasks || 0), 0)
  const highPerformers = members.filter((m: any) => (m.completionRate || 0) >= 80).length
  const needsSupport = members.filter((m: any) => (m.completionRate || 0) < 60).length
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total tasks completed by team: ${totalTasks}`, margin, currentY)
  currentY += lineHeight
  doc.text(`High performers (80%+ completion): ${highPerformers} team members`, margin, currentY)
  currentY += lineHeight
  doc.text(`Members needing support (<60% completion): ${needsSupport} team members`, margin, currentY)
  currentY += lineHeight
  doc.text(`Total overdue tasks: ${totalOverdue}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Team efficiency score: ${reportData.overallCompletionRate || 0}%`, margin, currentY)
  currentY += 20
  
  // Performance insights
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Performance Insights', margin, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Productivity level: ${(reportData.overallCompletionRate || 0) >= 80 ? 'Excellent' : (reportData.overallCompletionRate || 0) >= 60 ? 'Good' : 'Needs Improvement'}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Workload distribution: ${reportData.totalMembers ? Math.round(totalTasks / reportData.totalMembers) : 0} tasks per team member on average`, margin, currentY)
  currentY += lineHeight
  doc.text(`Team collaboration: ${members.filter((m: any) => (m.tasksCompleted || 0) > 0).length} members actively contributing`, margin, currentY)
  currentY += lineHeight
  doc.text(`Quality metrics: ${totalTasks > 0 ? Math.round((totalTasks - totalOverdue) / totalTasks * 100) : 0}% on-time delivery rate`, margin, currentY)
  currentY += 20
  
  // Recommendations
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Recommendations', margin, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`• Provide additional support to ${needsSupport} team members with completion rates below 60%`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Recognize and leverage best practices from high-performing team members`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Address ${totalOverdue} overdue tasks through priority management`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Consider workload redistribution to balance team capacity`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Establish regular team check-ins to monitor progress and obstacles`, margin, currentY)
  
  // Simple footer
  currentY += 30
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Generated by Task Flow Analytics System', margin, currentY)
  
  // Save the PDF
  const fileName = `Analytics Report – Team Performance – ${format(new Date(), 'dd_MM_yyyy')}.pdf`
  doc.save(fileName)
}

// Simple Organization Report
export const generateOrganizationReportPDF = (reportData: any) => {
  const doc = new jsPDF()
  const pageHeight = 297 // A4 page height in mm
  const margin = 20
  const lineHeight = 12
  
  // Simple header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Organization Performance Report', margin, 30)
  
  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 40)
  
  let currentY = 60
  
  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage()
      currentY = 20
      return true
    }
    return false
  }
  
  // Basic organization overview
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Organization Overview', margin, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Employees: ${reportData.totalEmployees || 0}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Total Departments: ${reportData.totalDepartments || 0}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Overall Completion Rate: ${reportData.overallCompletionRate || 0}%`, margin, currentY)
  currentY += lineHeight
  doc.text(`Average Task Time: ${reportData.averageTaskTime || 0} days`, margin, currentY)
  currentY += 20
  
  // Department performance
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Department Performance', margin, currentY)
  currentY += 15
  
  const departments = reportData.departments || []
  departments.forEach((dept: any, index: number) => {
    // Check if we need a new page for each department
    checkPageBreak(40)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${dept.name || 'N/A'} Department`, margin, currentY)
    currentY += 8
    doc.text(`  • Members: ${dept.memberCount || 0}`, margin + 5, currentY)
    currentY += 8
    doc.text(`  • Tasks Completed: ${dept.tasksCompleted || 0}`, margin + 5, currentY)
    currentY += 8
    doc.text(`  • Completion Rate: ${dept.completionRate || 0}%`, margin + 5, currentY)
    currentY += 8
    doc.text(`  • Average Time: ${dept.averageTime || 0} days`, margin + 5, currentY)
    currentY += 12
  })
  
  // Organization statistics
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Organization Statistics', margin, currentY)
  currentY += 15
  
  const totalTasks = departments.reduce((sum: number, dept: any) => sum + (dept.tasksCompleted || 0), 0)
  const totalOverdue = departments.reduce((sum: number, dept: any) => sum + (dept.overdueTasks || 0), 0)
  const highPerformingDepts = departments.filter((d: any) => (d.completionRate || 0) >= 80).length
  const needsSupportDepts = departments.filter((d: any) => (d.completionRate || 0) < 60).length
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total tasks completed: ${totalTasks}`, margin, currentY)
  currentY += lineHeight
  doc.text(`High performing departments (80%+ completion): ${highPerformingDepts}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Departments needing support (<60% completion): ${needsSupportDepts}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Total overdue tasks: ${totalOverdue}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Organization efficiency score: ${reportData.overallCompletionRate || 0}%`, margin, currentY)
  currentY += 20
  
  // Performance insights
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Performance Insights', margin, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Organization productivity: ${(reportData.overallCompletionRate || 0) >= 70 ? 'Strong' : (reportData.overallCompletionRate || 0) >= 50 ? 'Moderate' : 'Needs Improvement'}`, margin, currentY)
  currentY += lineHeight
  doc.text(`Workload distribution: ${reportData.totalEmployees ? Math.round(totalTasks / reportData.totalEmployees) : 0} tasks per employee on average`, margin, currentY)
  currentY += lineHeight
  doc.text(`Department collaboration: ${departments.filter((d: any) => (d.tasksCompleted || 0) > 0).length} departments actively contributing`, margin, currentY)
  currentY += lineHeight
  doc.text(`Quality metrics: ${totalTasks > 0 ? Math.round((totalTasks - totalOverdue) / totalTasks * 100) : 0}% on-time delivery rate`, margin, currentY)
  currentY += 20
  
  // Recommendations
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Strategic Recommendations', margin, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`• Focus on departments with completion rates below 60% for targeted improvement`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Implement cross-department collaboration to share best practices`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Consider resource reallocation based on workload and performance metrics`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Establish regular performance reviews and goal-setting sessions`, margin, currentY)
  currentY += lineHeight
  doc.text(`• Monitor and address overdue tasks to improve overall efficiency`, margin, currentY)
  
  // Simple footer
  currentY += 30
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Generated by Task Flow Analytics System', margin, currentY)
  
  // Save the PDF
  const fileName = `Analytics Report – Organization Performance – ${format(new Date(), 'dd_MM_yyyy')}.pdf`
  doc.save(fileName)
}

// Simple User Task Report
export const generateUserTaskReportPDF = (reportData: any) => {
  const doc = new jsPDF()
  const pageHeight = 297 // A4 page height in mm
  const margin = 20
  const lineHeight = 12
  
  // Simple header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('User Task Report', margin, 30)
  
  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 40)
  
  let currentY = 60
  
  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage()
      currentY = 20
      return true
    }
    return false
  }
  
  // Basic user overview
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Task Overview', 20, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Tasks: ${reportData.totalTasks || 0}`, 20, currentY)
  currentY += 12
  doc.text(`Completed Tasks: ${reportData.completedTasks || 0}`, 20, currentY)
  currentY += 12
  doc.text(`Completion Rate: ${reportData.completionRate || 0}%`, 20, currentY)
  currentY += 20
  
  // Task details
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Task Details', 20, currentY)
  currentY += 15
  
  const tasks = reportData.tasks || []
  tasks.forEach((task: any, index: number) => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${task.title || 'N/A'}`, 20, currentY)
    currentY += 8
    doc.text(`  • Status: ${task.status || 'N/A'}`, 25, currentY)
    currentY += 8
    doc.text(`  • Priority: ${task.priority || 'N/A'}`, 25, currentY)
    currentY += 8
    doc.text(`  • Due Date: ${task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}`, 25, currentY)
    currentY += 8
    doc.text(`  • Project: ${task.projectTitle || 'N/A'}`, 25, currentY)
    currentY += 12
  })
  
  // Performance insights
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Performance Insights', 20, currentY)
  currentY += 15
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Task completion rate: ${reportData.completionRate || 0}%`, 20, currentY)
  currentY += 12
  doc.text(`Productivity level: ${(reportData.completionRate || 0) >= 80 ? 'Excellent' : (reportData.completionRate || 0) >= 60 ? 'Good' : 'Needs Improvement'}`, 20, currentY)
  currentY += 12
  doc.text(`Active tasks: ${(reportData.totalTasks || 0) - (reportData.completedTasks || 0)} remaining`, 20, currentY)
  currentY += 12
  doc.text(`Task distribution: ${reportData.completedTasks || 0} completed, ${(reportData.totalTasks || 0) - (reportData.completedTasks || 0)} in progress`, 20, currentY)
  
  // Simple footer
  currentY += 30
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Generated by Task Vantage Analytics System', 20, currentY)
  
  // Save the PDF
  const fileName = `User_Task_Summary_${format(new Date(), 'dd_MM_yyyy')}.pdf`
  doc.save(fileName)
}
