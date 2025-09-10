"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  Download,
} from "lucide-react";

export default function ReportsPage() {
  const mockReports = [
    {
      id: 1,
      title: "Monthly Patient Report",
      description: "Comprehensive patient statistics and demographics",
      type: "Patient Analytics",
      lastGenerated: "2024-01-15",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 2,
      title: "Appointment Analytics",
      description:
        "Appointment trends, completion rates, and scheduling patterns",
      type: "Appointment Analytics",
      lastGenerated: "2024-01-14",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 3,
      title: "Revenue Report",
      description: "Financial performance and revenue analysis",
      type: "Financial",
      lastGenerated: "2024-01-13",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      id: 4,
      title: "Department Performance",
      description: "Department-wise statistics and performance metrics",
      type: "Operational",
      lastGenerated: "2024-01-12",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: 5,
      title: "Staff Productivity",
      description: "Staff performance and productivity analysis",
      type: "HR Analytics",
      lastGenerated: "2024-01-11",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: 6,
      title: "System Usage Report",
      description: "Platform usage statistics and user engagement",
      type: "System Analytics",
      lastGenerated: "2024-01-10",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  const mockStats = {
    totalReports: 24,
    generatedThisMonth: 12,
    scheduledReports: 8,
    averageGenerationTime: "2.3 minutes",
  };

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and view comprehensive system reports
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Custom Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Available report templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockStats.generatedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">Reports generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockStats.scheduledReports}
            </div>
            <p className="text-xs text-muted-foreground">Automated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockStats.averageGenerationTime}
            </div>
            <p className="text-xs text-muted-foreground">Generation time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {report.icon}
                {report.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{report.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Generated:</span>
                <span className="font-medium">
                  {new Date(report.lastGenerated).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Common reporting tasks and utilities
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Patient Summary
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Daily Schedule
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Revenue Analysis
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Activity className="h-6 w-6" />
              System Health
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Custom Report Builder</CardTitle>
          <p className="text-blue-700">
            Create custom reports tailored to your specific needs
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-blue-600 mb-2">
                Build custom reports with advanced filtering, data
                visualization, and automated scheduling capabilities.
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Advanced filtering options</li>
                <li>• Multiple export formats (PDF, Excel, CSV)</li>
                <li>• Automated scheduling and delivery</li>
                <li>• Interactive charts and graphs</li>
              </ul>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              Start Building
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
