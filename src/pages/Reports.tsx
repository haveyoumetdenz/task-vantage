import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useFirebaseAnalytics } from "@/hooks/useFirebaseAnalytics";
import { ReportFilterDialog, ReportFilters } from "@/components/reports/ReportFilterDialog";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Filter,
  Plus,
  Target,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const chartConfig = {
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  created: { label: "Created", color: "hsl(var(--chart-2))" },
  tasks: { label: "Tasks", color: "hsl(var(--chart-3))" },
  completionRate: { label: "Completion Rate", color: "hsl(var(--chart-4))" },
};

export default function Reports() {
  const { taskAnalytics, projectAnalytics, teamAnalytics, activityTrends, loading, error } = useFirebaseAnalytics();
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [generateReportDialogOpen, setGenerateReportDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    taskStatus: [],
    priority: [],
    projectIds: [],
    includeCompleted: true,
    includeOverdue: true,
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg font-medium">Error loading analytics</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const reportCards = taskAnalytics ? [
    {
      title: "Task Completion Rate",
      value: `${taskAnalytics.completionRate}%`,
      change: taskAnalytics.completionRate >= 80 ? "+Good" : "Low",
      changeType: taskAnalytics.completionRate >= 80 ? "positive" : "negative",
      description: "Tasks completed",
      icon: Target,
    },
    {
      title: "Average Time to Complete",
      value: `${taskAnalytics.avgCompletionTime.toFixed(1)} days`,
      change: taskAnalytics.avgCompletionTime <= 5 ? "Good" : "High",
      changeType: taskAnalytics.avgCompletionTime <= 5 ? "positive" : "negative", 
      description: "Average completion time",
      icon: Clock,
    },
    {
      title: "Active Tasks",
      value: `${taskAnalytics.inProgressTasks + taskAnalytics.todoTasks}`,
      change: `${taskAnalytics.totalTasks} total`,
      changeType: "neutral",
      description: "Tasks in progress + todo",
      icon: BarChart3,
    },
    {
      title: "Overdue Tasks",
      value: `${taskAnalytics.overdueTasks}`,
      change: taskAnalytics.overdueTasks === 0 ? "None" : "Action needed",
      changeType: taskAnalytics.overdueTasks === 0 ? "positive" : "negative",
      description: "Tasks past due date",
      icon: AlertTriangle,
    },
  ] : [];

  const taskStatusData = taskAnalytics ? [
    { name: "Completed", value: taskAnalytics.completedTasks, color: COLORS[0] },
    { name: "In Progress", value: taskAnalytics.inProgressTasks, color: COLORS[1] },
    { name: "To Do", value: taskAnalytics.todoTasks, color: COLORS[2] },
    { name: "In Review", value: taskAnalytics.inReviewTasks, color: COLORS[3] },
  ].filter(item => item.value > 0) : [];

  const teamProductivityData = teamAnalytics ? Object.entries(teamAnalytics.tasksPerMember).map(([name, tasks]) => ({
    name: name.split(' ')[0], // First name only for chart
    tasks,
    completionRate: teamAnalytics.completionRatePerMember[name] || 0
  })) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track performance and get insights into your workflow.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setGenerateReportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card) => (
          <Card key={card.title} className="hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className={
                  card.changeType === "positive" ? "text-success" : 
                  card.changeType === "negative" ? "text-destructive" : 
                  "text-muted-foreground"
                }>
                  {card.change}
                </span>
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Current status of all tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {taskStatusData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No task data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>Task creation and completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                {activityTrends.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityTrends}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="hsl(var(--chart-1))" 
                          strokeWidth={2}
                          name="Completed"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="created" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          name="Created"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Metrics</CardTitle>
                <CardDescription>Performance indicators for task management</CardDescription>
              </CardHeader>
              <CardContent>
                {taskAnalytics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Tasks</span>
                      <span className="font-medium">{taskAnalytics.totalTasks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-medium">{taskAnalytics.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Completion Time</span>
                      <span className="font-medium">{taskAnalytics.avgCompletionTime.toFixed(1)} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overdue Tasks</span>
                      <span className={`font-medium ${taskAnalytics.overdueTasks > 0 ? 'text-destructive' : 'text-success'}`}>
                        {taskAnalytics.overdueTasks}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Performance Analytics</p>
                    <p className="text-sm">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Project statistics and health</CardDescription>
              </CardHeader>
              <CardContent>
                {projectAnalytics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Projects</span>
                      <span className="font-medium">{projectAnalytics.totalProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Projects</span>
                      <span className="font-medium">{projectAnalytics.activeProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Projects</span>
                      <span className="font-medium">{projectAnalytics.completedProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projects with Overdue Tasks</span>
                      <span className={`font-medium ${projectAnalytics.projectsWithOverdueTasks > 0 ? 'text-destructive' : 'text-success'}`}>
                        {projectAnalytics.projectsWithOverdueTasks}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Project Analytics</p>
                    <p className="text-sm">No project data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance</CardTitle>
              <CardDescription>Detailed project analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {projectAnalytics && projectAnalytics.totalProjects > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chart-1">{projectAnalytics.activeProjects}</div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chart-2">{projectAnalytics.completedProjects}</div>
                    <p className="text-sm text-muted-foreground">Completed Projects</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${projectAnalytics.projectsWithOverdueTasks > 0 ? 'text-destructive' : 'text-success'}`}>
                      {projectAnalytics.projectsWithOverdueTasks}
                    </div>
                    <p className="text-sm text-muted-foreground">Projects with Overdue Tasks</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Project Analytics</p>
                  <p className="text-sm">Create some projects to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>Team performance and workload distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {teamAnalytics && teamProductivityData.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-chart-1">{teamAnalytics.totalTeamMembers}</div>
                      <p className="text-sm text-muted-foreground">Team Members</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-chart-2">{teamAnalytics.activeMembers}</div>
                      <p className="text-sm text-muted-foreground">Active Members</p>
                    </div>
                  </div>
                  
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamProductivityData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tasks" fill="hsl(var(--chart-3))" name="Tasks Assigned" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Team Performance</p>
                  <p className="text-sm">Join a team to see team analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filter Dialog */}
      <ReportFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Generate Report Dialog */}
      <GenerateReportDialog
        open={generateReportDialogOpen}
        onOpenChange={setGenerateReportDialogOpen}
        taskAnalytics={taskAnalytics}
        projectAnalytics={projectAnalytics}
        teamAnalytics={teamAnalytics}
        activityTrends={activityTrends}
      />
    </div>
  );
}