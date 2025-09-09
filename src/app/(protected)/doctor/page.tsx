import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Users,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
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

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  // if (user.role !== "doctor") {
  //   redirect("/dashboard");
  // }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "review":
        return <FileText className="h-4 w-4 text-orange-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Stethoscope className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const mockDoctorStats = {
    todayAppointments: 12,
    pendingReviews: 8,
    totalPatients: 156,
    completedToday: 6,
    urgentCases: 2,
    patientSatisfaction: 94.8,
  };

  const mockRecentActivities = [
    {
      id: 1,
      type: "urgent",
      message: "Urgent case: Patient John Doe requires immediate attention",
      time: "10 minutes ago",
      priority: "urgent",
    },
    {
      id: 2,
      type: "review",
      message: "Lab results ready for review - Patient Sarah Wilson",
      time: "25 minutes ago",
      priority: "high",
    },
    {
      id: 3,
      type: "appointment",
      message: "Appointment reminder: Follow-up with Robert Johnson",
      time: "1 hour ago",
      priority: "normal",
    },
    {
      id: 4,
      type: "message",
      message: "New prescription request from Patient Emily Davis",
      time: "2 hours ago",
      priority: "normal",
    },
  ];

  const mockTodaySchedule = [
    {
      id: 1,
      patient: "John Doe",
      time: "9:00 AM",
      type: "Follow-up",
      status: "completed",
      notes: "Blood pressure monitoring",
    },
    {
      id: 2,
      patient: "Sarah Wilson",
      time: "10:30 AM",
      type: "Consultation",
      status: "in-progress",
      notes: "Chest pain evaluation",
    },
    {
      id: 3,
      patient: "Robert Johnson",
      time: "11:15 AM",
      type: "Physical Exam",
      status: "upcoming",
      notes: "Annual checkup",
    },
    {
      id: 4,
      patient: "Emily Davis",
      time: "2:00 PM",
      type: "Follow-up",
      status: "upcoming",
      notes: "Medication review",
    },
    {
      id: 5,
      patient: "Michael Brown",
      time: "3:30 PM",
      type: "Consultation",
      status: "upcoming",
      notes: "Back pain assessment",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="bg-gradient-to-r bg-primary p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-foreground p-3 rounded-full">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-primary-foreground mt-1">
              Manage your patients and appointments efficiently.
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
                {mockDoctorStats.todayAppointments}
              </p>
              <p className="text-sm">Today&apos;s Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {mockDoctorStats.pendingReviews}
              </p>
              <p className="text-sm">Pending Reviews</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {mockDoctorStats.totalPatients}
              </p>
              <p className="text-sm">Total Patients</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {mockDoctorStats.patientSatisfaction}%
              </p>
              <p className="text-sm">Satisfaction</p>
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
                Latest updates and notifications
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div
                key={activity.id}
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
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common doctor tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/doctor/patients">
                <Users className="mr-2 h-4 w-4" />
                View Patients
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/doctor/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Schedule
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/doctor/records">
                <FileText className="mr-2 h-4 w-4" />
                Medical Records
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/doctor/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Today&apos;s Schedule</span>
            </CardTitle>
            <CardDescription>
              Your appointments and patient visits for today
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/doctor/schedule">View Full Schedule</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTodaySchedule.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{appointment.patient}</h4>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {appointment.time}
                    </span>
                    <span className="text-sm text-gray-600">
                      {appointment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {appointment.notes}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button size="sm" variant="outline">
                    {appointment.status === "completed"
                      ? "View Notes"
                      : "Start Visit"}
                  </Button>
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
