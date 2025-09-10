// TODO: Investigate data not adding up

import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStatistics,
  getRecentActivities,
  getDepartmentStats,
} from "@/actions";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch live data from server actions
  const [statsResult, activitiesResult, deptStatsResult] = await Promise.all([
    getDashboardStatistics(),
    getRecentActivities(6),
    getDepartmentStats(),
  ]);

  const liveStats =
    statsResult.success && statsResult.statistics
      ? statsResult.statistics
      : {
          users: {
            totalPatients: 0,
            totalStaff: 0,
            totalDoctors: 0,
            newUsersThisMonth: 0,
          },
          appointments: { todayAppointments: 0, completedAppointments: 0 },
          departments: { totalDepartments: 0 },
          feedback: { pendingFeedback: 0 },
        };

  const liveActivities =
    activitiesResult.success && activitiesResult.activities
      ? activitiesResult.activities
      : [];

  const liveDepartmentStats =
    deptStatsResult.success && deptStatsResult.departments
      ? deptStatsResult.departments
      : [
          {
            name: "No departments found",
            patients: 0,
            satisfaction: 0,
            appointments: 0,
          },
        ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_patient":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-green-600" />;
      case "feedback":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "staff":
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      <div className="bg-gradient-to-r bg-primary p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-foreground p-3 rounded-full">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Hospital Overview</h1>
            <p className="text-primary-foreground mt-1">
              Comprehensive system management and analytics dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="flex items-center gap-4 mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {(liveStats.users.totalPatients || 0).toLocaleString()}
              </p>
              <p className="text-sm">Patients</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <Activity className="h-8 w-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-teal-600">
                {(
                  (liveStats.users.totalDoctors || 0) +
                  (liveStats.users.totalStaff || 0)
                ).toLocaleString()}
              </p>
              <p className="text-sm">Staff</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {liveStats.appointments.todayAppointments || 0}
              </p>
              <p className="text-sm">Today&apos;s Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {liveStats.feedback.pendingFeedback || 0}
              </p>
              <p className="text-sm">Pending Feedback</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest system activities and events
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveActivities && liveActivities.length > 0 ? (
              liveActivities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(activity.priority)}>
                    {activity.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activities found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/patients">
                <Users className="mr-2 h-4 w-4" />
                Manage Patients
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/staffs">
                <Activity className="mr-2 h-4 w-4" />
                Manage Staffs
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/doctors">
                <Users className="mr-2 h-4 w-4" />
                Manage Doctors
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/departments">
                <Users className="mr-2 h-4 w-4" />
                Manage Departments
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Appointments
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/settings">
                <Activity className="mr-2 h-4 w-4" />
                System Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Department Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Department Overview</span>
            </CardTitle>
            <CardDescription>Performance metrics by department</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reports">Detailed Reports</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveDepartmentStats.map((dept, index) => (
              <div
                key={`${dept.name}-${index}`}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold mb-3">{dept.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="">Patients:</span>
                    <span className="font-medium">{dept.patients}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="">Satisfaction:</span>
                    <span
                      className={`font-medium ${
                        dept.satisfaction >= 95
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {dept.satisfaction}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="">Appointments:</span>
                    <span className="font-medium">{dept.appointments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
