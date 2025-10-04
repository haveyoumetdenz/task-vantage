import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed analytics imports - will create Firebase version later

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskAnalytics: TaskAnalytics | null;
  projectAnalytics: ProjectAnalytics | null;
  teamAnalytics: TeamAnalytics | null;
  activityTrends: ActivityTrend[];
}

interface ReportConfig {
  title: string;
  format: "pdf" | "csv";
  includeTaskMetrics: boolean;
  includeProjectMetrics: boolean;
  includeTeamMetrics: boolean;
  includeActivityTrends: boolean;
  includeCharts: boolean;
  customNotes: string;
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  taskAnalytics,
  projectAnalytics,
  teamAnalytics,
  activityTrends,
}: GenerateReportDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    title: `Analytics Report - ${new Date().toLocaleDateString()}`,
    format: "pdf",
    includeTaskMetrics: true,
    includeProjectMetrics: true,
    includeTeamMetrics: true,
    includeActivityTrends: true,
    includeCharts: true,
    customNotes: "",
  });

  const generateCSVReport = () => {
    let csvContent = `Analytics Report\nGenerated: ${new Date().toISOString()}\n\n`;

    if (config.includeTaskMetrics && taskAnalytics) {
      csvContent += "TASK METRICS\n";
      csvContent += `Total Tasks,${taskAnalytics.totalTasks}\n`;
      csvContent += `Completed Tasks,${taskAnalytics.completedTasks}\n`;
      csvContent += `In Progress Tasks,${taskAnalytics.inProgressTasks}\n`;
      csvContent += `Todo Tasks,${taskAnalytics.todoTasks}\n`;
      csvContent += `In Review Tasks,${taskAnalytics.inReviewTasks}\n`;
      csvContent += `Overdue Tasks,${taskAnalytics.overdueTasks}\n`;
      csvContent += `Completion Rate,${taskAnalytics.completionRate}%\n`;
      csvContent += `Average Completion Time,${taskAnalytics.avgCompletionTime.toFixed(1)} days\n\n`;
    }

    if (config.includeProjectMetrics && projectAnalytics) {
      csvContent += "PROJECT METRICS\n";
      csvContent += `Total Projects,${projectAnalytics.totalProjects}\n`;
      csvContent += `Active Projects,${projectAnalytics.activeProjects}\n`;
      csvContent += `Completed Projects,${projectAnalytics.completedProjects}\n`;
      csvContent += `Projects with Overdue Tasks,${projectAnalytics.projectsWithOverdueTasks}\n\n`;
    }

    if (config.includeTeamMetrics && teamAnalytics) {
      csvContent += "TEAM METRICS\n";
      csvContent += `Total Team Members,${teamAnalytics.totalTeamMembers}\n`;
      csvContent += `Active Members,${teamAnalytics.activeMembers}\n\n`;
      
      csvContent += "TEAM MEMBER TASKS\n";
      csvContent += "Member Name,Tasks Assigned,Completion Rate\n";
      Object.entries(teamAnalytics.tasksPerMember).forEach(([name, tasks]) => {
        const completionRate = teamAnalytics.completionRatePerMember[name] || 0;
        csvContent += `${name},${tasks},${completionRate}%\n`;
      });
      csvContent += "\n";
    }

    if (config.includeActivityTrends && activityTrends.length > 0) {
      csvContent += "ACTIVITY TRENDS\n";
      csvContent += "Date,Tasks Created,Tasks Completed\n";
      activityTrends.forEach(trend => {
        csvContent += `${trend.date},${trend.created},${trend.completed}\n`;
      });
      csvContent += "\n";
    }

    if (config.customNotes) {
      csvContent += `NOTES\n${config.customNotes}\n`;
    }

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFReport = () => {
    // For PDF generation, we'll create a printable HTML version
    let htmlContent = `
      <html>
        <head>
          <title>${config.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
            .section { margin-bottom: 30px; }
            .metric { margin-bottom: 10px; }
            .metric-label { font-weight: bold; display: inline-block; width: 200px; }
            .metric-value { display: inline-block; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${config.title}</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
    `;

    if (config.includeTaskMetrics && taskAnalytics) {
      htmlContent += `
        <div class="section">
          <h2>Task Metrics</h2>
          <div class="metric"><span class="metric-label">Total Tasks:</span><span class="metric-value">${taskAnalytics.totalTasks}</span></div>
          <div class="metric"><span class="metric-label">Completed Tasks:</span><span class="metric-value">${taskAnalytics.completedTasks}</span></div>
          <div class="metric"><span class="metric-label">In Progress Tasks:</span><span class="metric-value">${taskAnalytics.inProgressTasks}</span></div>
          <div class="metric"><span class="metric-label">Todo Tasks:</span><span class="metric-value">${taskAnalytics.todoTasks}</span></div>
          <div class="metric"><span class="metric-label">In Review Tasks:</span><span class="metric-value">${taskAnalytics.inReviewTasks}</span></div>
          <div class="metric"><span class="metric-label">Overdue Tasks:</span><span class="metric-value">${taskAnalytics.overdueTasks}</span></div>
          <div class="metric"><span class="metric-label">Completion Rate:</span><span class="metric-value">${taskAnalytics.completionRate}%</span></div>
          <div class="metric"><span class="metric-label">Average Completion Time:</span><span class="metric-value">${taskAnalytics.avgCompletionTime.toFixed(1)} days</span></div>
        </div>
      `;
    }

    if (config.includeProjectMetrics && projectAnalytics) {
      htmlContent += `
        <div class="section">
          <h2>Project Metrics</h2>
          <div class="metric"><span class="metric-label">Total Projects:</span><span class="metric-value">${projectAnalytics.totalProjects}</span></div>
          <div class="metric"><span class="metric-label">Active Projects:</span><span class="metric-value">${projectAnalytics.activeProjects}</span></div>
          <div class="metric"><span class="metric-label">Completed Projects:</span><span class="metric-value">${projectAnalytics.completedProjects}</span></div>
          <div class="metric"><span class="metric-label">Projects with Overdue Tasks:</span><span class="metric-value">${projectAnalytics.projectsWithOverdueTasks}</span></div>
        </div>
      `;
    }

    if (config.includeTeamMetrics && teamAnalytics) {
      htmlContent += `
        <div class="section">
          <h2>Team Metrics</h2>
          <div class="metric"><span class="metric-label">Total Team Members:</span><span class="metric-value">${teamAnalytics.totalTeamMembers}</span></div>
          <div class="metric"><span class="metric-label">Active Members:</span><span class="metric-value">${teamAnalytics.activeMembers}</span></div>
          
          <h3>Team Member Tasks</h3>
          <table>
            <tr><th>Member Name</th><th>Tasks Assigned</th><th>Completion Rate</th></tr>
      `;
      
      Object.entries(teamAnalytics.tasksPerMember).forEach(([name, tasks]) => {
        const completionRate = teamAnalytics.completionRatePerMember[name] || 0;
        htmlContent += `<tr><td>${name}</td><td>${tasks}</td><td>${completionRate}%</td></tr>`;
      });
      
      htmlContent += `
          </table>
        </div>
      `;
    }

    if (config.includeActivityTrends && activityTrends.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>Activity Trends</h2>
          <table>
            <tr><th>Date</th><th>Tasks Created</th><th>Tasks Completed</th></tr>
      `;
      
      activityTrends.forEach(trend => {
        htmlContent += `<tr><td>${new Date(trend.date).toLocaleDateString()}</td><td>${trend.created}</td><td>${trend.completed}</td></tr>`;
      });
      
      htmlContent += `
          </table>
        </div>
      `;
    }

    if (config.customNotes) {
      htmlContent += `
        <div class="section">
          <h2>Notes</h2>
          <p>${config.customNotes.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }

    htmlContent += `
        </body>
      </html>
    `;

    // Open in new window for printing to PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      if (config.format === "csv") {
        generateCSVReport();
      } else {
        generatePDFReport();
      }
      
      toast({
        title: "Report Generated",
        description: `Your ${config.format.toUpperCase()} report has been generated successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            Customize and generate a comprehensive analytics report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={config.format} onValueChange={(value: "pdf" | "csv") => 
              setConfig(prev => ({ ...prev, format: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Sections */}
          <div className="space-y-3">
            <Label>Include Sections</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTaskMetrics"
                  checked={config.includeTaskMetrics}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeTaskMetrics: checked as boolean }))
                  }
                />
                <Label htmlFor="includeTaskMetrics">Task Metrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeProjectMetrics"
                  checked={config.includeProjectMetrics}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeProjectMetrics: checked as boolean }))
                  }
                />
                <Label htmlFor="includeProjectMetrics">Project Metrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTeamMetrics"
                  checked={config.includeTeamMetrics}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeTeamMetrics: checked as boolean }))
                  }
                />
                <Label htmlFor="includeTeamMetrics">Team Metrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeActivityTrends"
                  checked={config.includeActivityTrends}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeActivityTrends: checked as boolean }))
                  }
                />
                <Label htmlFor="includeActivityTrends">Activity Trends</Label>
              </div>
              {config.format === "pdf" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={config.includeCharts}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeCharts">Include Charts</Label>
                </div>
              )}
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Custom Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or context for this report..."
              value={config.customNotes}
              onChange={(e) => setConfig(prev => ({ ...prev, customNotes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}