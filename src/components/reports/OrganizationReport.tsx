import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Download, Building2, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Target, Award, Calendar } from 'lucide-react'
import { useOrganizationReport } from '@/hooks/useOrganizationReport'
import { generateOrganizationReportPDF } from '@/utils/pdfExportSimple'

export const OrganizationReport: React.FC = () => {
  const { reportData, loading, error } = useOrganizationReport()

  const handleExportPDF = () => {
    if (reportData) {
      generateOrganizationReportPDF(reportData)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading organization data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Report</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Organization Data Available</h3>
        <p className="text-muted-foreground">No data found to generate organization report.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organization Performance Report</h1>
            <p className="text-blue-100 text-lg">
              Comprehensive analysis of organizational productivity and performance metrics
            </p>
            <div className="flex items-center gap-4 mt-4 text-blue-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Generated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{reportData.totalDepartments} Departments</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleExportPDF} 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{reportData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active workforce</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reportData.overallCompletionRate}%</div>
            <div className="mt-2">
              <Progress value={reportData.overallCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Task Time</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{reportData.averageTaskTime}</div>
            <p className="text-xs text-muted-foreground mt-1">days to complete</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{reportData.totalDepartments}</div>
            <p className="text-xs text-muted-foreground mt-1">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5" />
            Department Performance Analysis
          </CardTitle>
          <p className="text-muted-foreground">
            Detailed breakdown of performance metrics by department
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reportData.departments.map((department, index) => (
              <div key={department.name} className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {department.name.replace('-', ' ')}
                      </h3>
                      <p className="text-muted-foreground">
                        {department.memberCount} team members
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={department.completionRate >= 80 ? "default" : department.completionRate >= 60 ? "secondary" : "destructive"}
                    className="text-sm px-3 py-1"
                  >
                    {department.completionRate}% Complete
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{department.tasksCompleted}</div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{department.averageTime}</div>
                    <div className="text-sm text-muted-foreground">Avg. Days</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{department.overdueTasks}</div>
                    <div className="text-sm text-muted-foreground">Overdue Tasks</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{department.completionRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Completion Progress</span>
                    <span>{department.completionRate}%</span>
                  </div>
                  <Progress value={department.completionRate} className="h-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Overall completion rate of {reportData.overallCompletionRate}%
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {reportData.totalDepartments} active departments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Average task completion time of {reportData.averageTaskTime} days
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-orange-600">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Monitor departments with lower completion rates
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Address overdue tasks across all departments
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Optimize task completion time where possible
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
