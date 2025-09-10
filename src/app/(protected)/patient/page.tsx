import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getPatientDashboard } from "@/actions";
import {
  Calendar,
  Clock,
  FileText,
  Heart,
  MessageSquare,
  Pill,
  Stethoscope,
  TrendingUp,
  User,
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

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: Date;
  priority: string;
  time: string;
}

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
}

interface DashboardStats {
  upcomingAppointments: number;
  pendingResults: number;
  activeMedications: number;
  unreadMessages: number;
  healthScore: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: Activity[];
  upcomingAppointments: Appointment[];
}

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  // Fetch actual dashboard data
  const dashboardResult = await getPatientDashboard();

  if (!dashboardResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <div className="bg-gradient-to-r bg-primary p-6 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-foreground p-3 rounded-full">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Patient Dashboard</h1>
              <p className="text-primary-foreground mt-1">
                Welcome back, {user.name}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading dashboard: {dashboardResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardData = dashboardResult.data as DashboardData;
  const stats = dashboardData.stats;
  const recentActivities = dashboardData.recentActivities;
  const upcomingAppointments = dashboardData.upcomingAppointments;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "medication":
        return <Pill className="h-4 w-4 text-green-600" />;
      case "result":
        return <FileText className="h-4 w-4 text-orange-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Heart className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      <div className="bg-gradient-to-r bg-primary p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-foreground p-3 rounded-full">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patient Dashboard</h1>
            <p className="text-primary-foreground mt-1">
              Manage your health records and appointments in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="flex items-center gap-4 mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.upcomingAppointments}
              </p>
              <p className="text-sm">Upcoming Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pendingResults}
              </p>
              <p className="text-sm">Pending Results</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <Pill className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.activeMedications}
              </p>
              <p className="text-sm">Active Medications</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.healthScore}%
              </p>
              <p className="text-sm">Health Score</p>
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
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest updates on your health and appointments
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/patient/medical-records">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: Activity) => (
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
                      {activity.time}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(activity.priority)}>
                    {activity.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activities</p>
                <p className="text-sm">
                  Your recent activities will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common patient tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/patient/appointments/book">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/patient/medical-records">
                <FileText className="mr-2 h-4 w-4" />
                Medical Records
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/patient/medications">
                <Pill className="mr-2 h-4 w-4" />
                Medications
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/patient/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <span>Upcoming Appointments</span>
            </CardTitle>
            <CardDescription>
              Your scheduled medical appointments
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/appointments">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-4 w-4 text-gray-600" />
                    <h4 className="font-semibold">{appointment.doctor}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {appointment.specialty}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{appointment.type}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No upcoming appointments</p>
                <p className="text-sm">
                  Book your first appointment to get started
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/patient/appointments/book">
                    Book Appointment
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
