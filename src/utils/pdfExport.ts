import jsPDF from 'jspdf'
import { format } from 'date-fns'

// Helper function to add professional header with gradient effect
const addHeader = (doc: jsPDF, title: string, color: number[] = [37, 99, 235]) => {
  // Header background
  doc.setFillColor(color[0], color[1], color[2])
  doc.rect(0, 0, 210, 50, 'F')
  
  // Title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(title, 20, 25)
  
  // Subtitle
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 255)
  doc.text('Comprehensive Performance Analysis', 20, 35)
  
  // Date
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, 45)
}

// Helper function to add section header with professional styling
const addSectionHeader = (doc: jsPDF, title: string, y: number, color: number[] = [37, 99, 235]) => {
  // Section background
  doc.setFillColor(248, 250, 252)
  doc.rect(15, y - 8, 180, 18, 'F')
  
  // Section title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(color[0], color[1], color[2])
  doc.text(title, 20, y + 3)
  
  // Underline
  doc.setDrawColor(color[0], color[1], color[2])
  doc.setLineWidth(1.5)
  doc.line(20, y + 5, 190, y + 5)
}

// Helper function to add professional metric cards with colors
const addMetricCard = (doc: jsPDF, title: string, value: string, x: number, y: number, width: number = 55, color: number[] = [37, 99, 235]) => {
  // Card background
  doc.setFillColor(248, 250, 252)
  doc.rect(x, y, width, 35, 'F')
  
  // Card border with color
  doc.setDrawColor(color[0], color[1], color[2])
  doc.setLineWidth(2)
  doc.rect(x, y, width, 35)
  
  // Left border accent
  doc.setFillColor(color[0], color[1], color[2])
  doc.rect(x, y, 5, 35, 'F')
  
  // Add title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(title, x + 8, y + 12)
  
  // Add value
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(color[0], color[1], color[2])
  doc.text(value, x + 8, y + 26)
}

// Helper function to add professional table with styling
const addTable = (doc: jsPDF, headers: string[], rows: string[][], startY: number, color: number[] = [37, 99, 235]) => {
  const colWidths = [50, 30, 30, 30, 30] // Better column widths
  const rowHeight = 12
  let currentY = startY
  
  // Table background
  doc.setFillColor(255, 255, 255)
  doc.rect(15, startY - 8, 180, (rows.length + 1) * rowHeight + 16, 'F')
  
  // Add headers with background
  doc.setFillColor(color[0], color[1], color[2])
  doc.rect(15, startY - 8, 180, rowHeight, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  headers.forEach((header, index) => {
    const xPos = 20 + (index * colWidths[index])
    doc.text(header, xPos, currentY)
  })
  
  currentY += rowHeight
  
  // Add rows with alternating colors
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  rows.forEach((row, rowIndex) => {
    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(15, currentY - 8, 180, rowHeight, 'F')
    }
    
    row.forEach((cell, index) => {
      const xPos = 20 + (index * colWidths[index])
      doc.text(cell, xPos, currentY)
    })
    currentY += rowHeight
  })
  
  // Table border
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(15, startY - 8, 180, (rows.length + 1) * rowHeight + 16)
}

// Helper function to add detailed insights section
const addDetailedInsights = (doc: jsPDF, insights: string[], startY: number, color: number[] = [37, 99, 235]) => {
  addSectionHeader(doc, 'Detailed Analysis & Insights', startY, color)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  insights.forEach((insight, index) => {
    doc.text(insight, 20, startY + 20 + (index * 12))
  })
}

// Helper function to add performance comparison
const addPerformanceComparison = (doc: jsPDF, data: any[], startY: number, color: number[] = [37, 99, 235]) => {
  addSectionHeader(doc, 'Performance Comparison', startY, color)
  
  // Find best and worst performers
  const sortedData = data.sort((a, b) => b.completionRate - a.completionRate)
  const bestPerformer = sortedData[0]
  const worstPerformer = sortedData[sortedData.length - 1]
  
  // Top Performer Section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(34, 197, 94) // Green for best
  doc.text('Top Performer:', 20, startY + 20)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  const bestName = bestPerformer.name ? bestPerformer.name.replace('-', ' ').toUpperCase() : 'N/A'
  doc.text(`${bestName}: ${bestPerformer.completionRate}% completion rate`, 20, startY + 32)
  
  // Needs Attention Section - Find departments/teams that need attention
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(239, 68, 68) // Red for needs attention
  doc.text('Needs Attention:', 20, startY + 50)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  
  // Find teams/departments with low performance (below 50% or with 0% completion)
  const needsAttention = data.filter(item => item.completionRate < 50 || item.completionRate === 0)
  
  if (needsAttention.length > 0) {
    const worstName = needsAttention[0].name ? needsAttention[0].name.replace('-', ' ').toUpperCase() : 'N/A'
    doc.text(`${worstName}: ${needsAttention[0].completionRate}% completion rate`, 20, startY + 62)
    
    // Add additional context if there are multiple poor performers
    if (needsAttention.length > 1) {
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`(${needsAttention.length} departments/teams below 50% completion)`, 20, startY + 72)
    }
  } else {
    // If no departments are below 50%, show the worst performer anyway
    const worstName = worstPerformer.name ? worstPerformer.name.replace('-', ' ').toUpperCase() : 'N/A'
    doc.text(`${worstName}: ${worstPerformer.completionRate}% completion rate`, 20, startY + 62)
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('(Lowest performing department/team)', 20, startY + 72)
  }
  
  // Performance Gap Analysis
  const performanceGap = bestPerformer.completionRate - worstPerformer.completionRate
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Performance gap: ${performanceGap}% difference between top and bottom performers`, 20, startY + 88)
}

// Helper function to add summary statistics
const addSummaryStats = (doc: jsPDF, reportData: any, startY: number, color: number[] = [37, 99, 235]) => {
  addSectionHeader(doc, 'Summary Statistics', startY, color)
  
  const totalTasks = reportData.departments?.reduce((sum: number, dept: any) => sum + dept.tasksCompleted, 0) || 0
  const totalOverdue = reportData.departments?.reduce((sum: number, dept: any) => sum + dept.overdueTasks, 0) || 0
  const avgCompletionTime = reportData.departments?.reduce((sum: number, dept: any) => sum + dept.averageTime, 0) / (reportData.departments?.length || 1) || 0
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  doc.text(`• Total tasks completed across organization: ${totalTasks}`, 20, startY + 20)
  doc.text(`• Average completion time: ${Math.round(avgCompletionTime)} days`, 20, startY + 30)
  doc.text(`• Total overdue tasks: ${totalOverdue}`, 20, startY + 40)
  doc.text(`• Organization efficiency score: ${reportData.overallCompletionRate}%`, 20, startY + 50)
}

// Export function for Team Performance Report
export const generateTeamPerformanceReportPDF = (reportData: any) => {
  const doc = new jsPDF()
  const greenColor = [34, 197, 94] // Green color for team reports
  
  // Add professional header
  addHeader(doc, 'Team Performance Report', greenColor)
  
  // Add summary metrics with colors - fix undefined values
  addSectionHeader(doc, 'Key Performance Indicators', 70, greenColor)
  addMetricCard(doc, 'Team Members', (reportData.totalMembers || 0).toString(), 20, 90, 55, greenColor)
  addMetricCard(doc, 'Completion Rate', `${reportData.overallCompletionRate || 0}%`, 85, 90, 55, [59, 130, 246]) // Blue
  addMetricCard(doc, 'Avg Task Time', `${reportData.averageTaskTime || 0} days`, 150, 90, 55, [249, 115, 22]) // Orange
  
  // Add team members table
  addSectionHeader(doc, 'Individual Team Member Performance', 140, greenColor)
  
  const headers = ['Team Member', 'Role', 'Completed', 'Rate %', 'Avg Time']
  const rows = (reportData.members || []).map((member: any) => [
    member.name || 'N/A',
    member.role || 'N/A',
    (member.tasksCompleted || 0).toString(),
    `${member.completionRate || 0}%`,
    `${member.averageTime || 0} days`
  ])
  
  addTable(doc, headers, rows, 160, greenColor)
  
  // Check if we need a new page for the rest of the content
  const tableEndY = 160 + (rows.length + 1) * 12 + 30
  const pageHeight = 297 // A4 page height in mm
  const currentY = tableEndY + 100 // Estimated space for performance comparison
  
  if (currentY > pageHeight - 50) {
    doc.addPage()
    addPerformanceComparison(doc, reportData.members || [], 20, greenColor)
  } else {
    addPerformanceComparison(doc, reportData.members || [], tableEndY, greenColor)
  }
  
  // Add team statistics - handle pagination
  let statsY = currentY > pageHeight - 50 ? 20 : tableEndY + 70
  
  // Check if we need a new page for team statistics
  if (statsY + 80 > pageHeight - 50) {
    doc.addPage()
    statsY = 20
  }
  
  addSectionHeader(doc, 'Team Statistics', statsY, greenColor)
  
  const members = reportData.members || []
  const totalTasks = members.reduce((sum: number, member: any) => sum + (member.tasksCompleted || 0), 0)
  const totalOverdue = members.reduce((sum: number, member: any) => sum + (member.overdueTasks || 0), 0)
  const highPerformers = members.filter((m: any) => (m.completionRate || 0) >= 80).length
  const needsSupport = members.filter((m: any) => (m.completionRate || 0) < 60).length
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`• Total tasks completed by team: ${totalTasks}`, 20, statsY + 20)
  doc.text(`• High performers (80%+ completion): ${highPerformers} team members`, 20, statsY + 30)
  doc.text(`• Members needing support (<60% completion): ${needsSupport} team members`, 20, statsY + 40)
  doc.text(`• Total overdue tasks: ${totalOverdue}`, 20, statsY + 50)
  doc.text(`• Team efficiency score: ${reportData.overallCompletionRate || 0}%`, 20, statsY + 60)
  
  // Add detailed insights - handle pagination
  let insightsY = statsY + 90
  
  // Check if we need a new page for insights
  if (insightsY + 120 > pageHeight - 50) {
    doc.addPage()
    insightsY = 20
  }
  
  const insights = [
    `• Team performance: ${reportData.overallCompletionRate || 0}% overall completion rate`,
    `• Productivity level: ${(reportData.overallCompletionRate || 0) >= 80 ? 'Excellent' : (reportData.overallCompletionRate || 0) >= 60 ? 'Good' : 'Needs Improvement'}`,
    `• Task velocity: ${reportData.averageTaskTime || 0} days average completion time`,
    `• Team capacity: ${reportData.totalMembers || 0} active team members`,
    `• Workload distribution: ${reportData.totalMembers ? Math.round(totalTasks / reportData.totalMembers) : 0} tasks per team member on average`,
    `• Performance consistency: ${members.length > 0 ? Math.max(...members.map((m: any) => m.completionRate || 0)) - Math.min(...members.map((m: any) => m.completionRate || 0)) : 0}% variance between best and worst performers`,
    `• Team collaboration: ${members.filter((m: any) => (m.tasksCompleted || 0) > 0).length} members actively contributing`,
    `• Quality metrics: ${totalTasks > 0 ? Math.round((totalTasks - totalOverdue) / totalTasks * 100) : 0}% on-time delivery rate`
  ]
  addDetailedInsights(doc, insights, insightsY, greenColor)
  
  // Add team recommendations - handle pagination
  let recommendationsY = insightsY + 120
  
  // Check if we need a new page for recommendations
  if (recommendationsY + 100 > pageHeight - 50) {
    doc.addPage()
    recommendationsY = 20
  }
  
  addSectionHeader(doc, 'Team Development Recommendations', recommendationsY, greenColor)
  
  const recommendations = [
    `• Provide additional support to ${needsSupport} team members with completion rates below 60%`,
    `• Recognize and leverage best practices from high-performing team members`,
    `• Implement peer mentoring programs to share knowledge and skills`,
    `• Address ${totalOverdue} overdue tasks through priority management`,
    `• Consider workload redistribution to balance team capacity`,
    `• Establish regular team check-ins to monitor progress and obstacles`
  ]
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  recommendations.forEach((rec, index) => {
    doc.text(rec, 20, recommendationsY + 20 + (index * 12))
  })
  
  // Add footer
  const footerY = Math.max(280, recommendationsY + 100)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('This comprehensive team report was generated by Task Vantage Analytics System', 20, footerY)
  doc.text(`Report covers ${reportData.totalMembers || 0} team members with ${totalTasks} completed tasks`, 20, footerY + 5)
  
  // Save the PDF
  const fileName = `Analytics Report – Team Performance – ${format(new Date(), 'dd_MM_yyyy')}.pdf`
  doc.save(fileName)
}

// Export function for Organization Report
export const generateOrganizationReportPDF = (reportData: any) => {
  const doc = new jsPDF()
  const blueColor = [37, 99, 235] // Blue color for organization reports
  
  // Add professional header
  addHeader(doc, 'Organization Performance Report', blueColor)
  
  // Add summary metrics with colors
  addSectionHeader(doc, 'Key Performance Indicators', 70, blueColor)
  addMetricCard(doc, 'Total Employees', reportData.totalEmployees.toString(), 20, 90, 55, blueColor)
  addMetricCard(doc, 'Departments', reportData.totalDepartments.toString(), 85, 90, 55, [139, 92, 246]) // Purple
  addMetricCard(doc, 'Completion Rate', `${reportData.overallCompletionRate}%`, 150, 90, 55, [34, 197, 94]) // Green
  
  // Add departments table
  addSectionHeader(doc, 'Department Performance Analysis', 140, blueColor)
  
  const headers = ['Department', 'Members', 'Completed', 'Rate %', 'Avg Time']
  const rows = reportData.departments.map((dept: any) => [
    dept.name.replace('-', ' ').toUpperCase(),
    dept.memberCount.toString(),
    dept.tasksCompleted.toString(),
    `${dept.completionRate}%`,
    `${dept.averageTime} days`
  ])
  
  addTable(doc, headers, rows, 160, blueColor)
  
  // Add performance comparison
  const tableEndY = 160 + (rows.length + 1) * 12 + 30
  addPerformanceComparison(doc, reportData.departments, tableEndY, blueColor)
  
  // Add summary statistics
  const comparisonEndY = tableEndY + 70
  addSummaryStats(doc, reportData, comparisonEndY, blueColor)
  
  // Add detailed insights
  const statsEndY = comparisonEndY + 80
  const insights = [
    `• Organization efficiency: ${reportData.overallCompletionRate}% completion rate across all departments`,
    `• Department diversity: ${reportData.totalDepartments} active departments with ${reportData.totalEmployees} total employees`,
    `• Performance variance: ${Math.max(...reportData.departments.map((d: any) => d.completionRate)) - Math.min(...reportData.departments.map((d: any) => d.completionRate))}% difference between best and worst performing departments`,
    `• Average task completion time: ${reportData.averageTaskTime} days across the organization`,
    `• Total tasks completed: ${reportData.departments.reduce((sum: number, dept: any) => sum + dept.tasksCompleted, 0)} tasks`,
    `• Overdue tasks: ${reportData.departments.reduce((sum: number, dept: any) => sum + dept.overdueTasks, 0)} tasks need immediate attention`,
    `• Resource allocation: ${reportData.departments.reduce((sum: number, dept: any) => sum + dept.memberCount, 0)} total team members distributed across departments`,
    `• Productivity trends: ${reportData.overallCompletionRate >= 70 ? 'Strong' : reportData.overallCompletionRate >= 50 ? 'Moderate' : 'Needs Improvement'} organizational performance`
  ]
  addDetailedInsights(doc, insights, statsEndY, blueColor)
  
  // Add recommendations
  const insightsEndY = statsEndY + 120
  addSectionHeader(doc, 'Strategic Recommendations', insightsEndY, blueColor)
  
  const recommendations = [
    `• Focus on departments with completion rates below 60% for targeted improvement`,
    `• Implement cross-department collaboration to share best practices`,
    `• Consider resource reallocation based on workload and performance metrics`,
    `• Establish regular performance reviews and goal-setting sessions`,
    `• Monitor and address overdue tasks to improve overall efficiency`
  ]
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  recommendations.forEach((rec, index) => {
    doc.text(rec, 20, insightsEndY + 20 + (index * 12))
  })
  
  // Add footer
  const footerY = Math.max(280, insightsEndY + 100)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('This comprehensive report was generated by Task Vantage Analytics System', 20, footerY)
  doc.text(`Report includes ${reportData.totalDepartments} departments, ${reportData.totalEmployees} employees, and ${reportData.departments.reduce((sum: number, dept: any) => sum + dept.tasksCompleted, 0)} completed tasks`, 20, footerY + 5)
  
  // Save the PDF
  const fileName = `Analytics Report – Organization Performance – ${format(new Date(), 'dd_MM_yyyy')}.pdf`
  doc.save(fileName)
}

// Export function for User Task Report (if needed)
export const generateUserTaskReportPDF = (reportData: any) => {
  const doc = new jsPDF()
  const purpleColor = [139, 92, 246] // Purple color for user reports
  
  // Add professional header
  addHeader(doc, 'User Task Report', purpleColor)
  
  // Add summary metrics with colors
  addSectionHeader(doc, 'Key Performance Indicators', 70, purpleColor)
  addMetricCard(doc, 'Total Tasks', reportData.totalTasks.toString(), 20, 90, 55, purpleColor)
  addMetricCard(doc, 'Completed', reportData.completedTasks.toString(), 85, 90, 55, [34, 197, 94]) // Green
  addMetricCard(doc, 'Completion Rate', `${reportData.completionRate}%`, 150, 90, 55, [59, 130, 246]) // Blue
  
  // Add tasks table
  addSectionHeader(doc, 'Task Details', 140, purpleColor)
  
  const headers = ['Task Title', 'Status', 'Priority', 'Due Date', 'Project']
  const rows = reportData.tasks.map((task: any) => [
    task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title,
    task.status,
    task.priority.toString(),
    task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A',
    task.projectTitle || 'N/A'
  ])
  
  addTable(doc, headers, rows, 160, purpleColor)
  
  // Add insights section
  const tableEndY = 160 + (rows.length + 1) * 10 + 20
  addSectionHeader(doc, 'Key Insights', tableEndY, purpleColor)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text('• Total tasks: ' + reportData.totalTasks, 20, tableEndY + 20)
  doc.text('• Completed tasks: ' + reportData.completedTasks, 20, tableEndY + 30)
  doc.text('• Completion rate: ' + reportData.completionRate + '%', 20, tableEndY + 40)
  
  // Save the PDF
  const fileName = `Analytics Report – User Tasks – ${format(new Date(), 'dd_MM_yyyy')}.pdf`
  doc.save(fileName)
}
