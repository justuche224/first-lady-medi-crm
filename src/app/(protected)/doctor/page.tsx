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
import {
  getDoctorDashboardStats,
  getDoctorTodaySchedule,
  getDoctorRecentActivities,
  getCurrentDoctorProfile,
} from "@/actions";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "doctor") {
    redirect("/dashboard");
  }

  // Fetch live data
  const [profileResult, statsResult, scheduleResult, activitiesResult] =
    await Promise.all([
      getCurrentDoctorProfile(),
      getDoctorDashboardStats(),
      getDoctorTodaySchedule(),
      getDoctorRecentActivities(4),
    ]);

  if (
    !profileResult.success ||
    !statsResult.success ||
    !scheduleResult.success ||
    !activitiesResult.success
  ) {
    console.error("Error loading dashboard data:", {
      profile: profileResult.error,
      stats: statsResult.error,
      schedule: scheduleResult.error,
      activities: activitiesResult.error,
    });
  }

  const doctorProfile = profileResult.success ? profileResult.profile : null;
  const doctorStats = statsResult.success
    ? statsResult.stats
    : {
        todayAppointments: 0,
        pendingReviews: 0,
        totalPatients: 0,
        completedToday: 0,
        urgentCases: 0,
        patientSatisfaction: 0,
        unreadMessages: 0,
        pendingLabResults: 0,
      };
  const todaySchedule = scheduleResult.success ? scheduleResult.schedule : [];
  const recentActivities = activitiesResult.success
    ? activitiesResult.activities
    : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medical_record":
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      <div className="bg-gradient-to-r bg-primary p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-foreground p-3 rounded-full">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {doctorProfile?.user?.name || user.name}
            </h1>
            <p className="text-primary-foreground mt-1">
              {doctorProfile?.doctor?.specialty &&
                `${doctorProfile.doctor.specialty} • `}
              {doctorProfile?.department?.name ||
                "Manage your patients and appointments efficiently."}
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
                {doctorStats?.todayAppointments || 0}
              </p>
              <p className="text-sm">Today&apos;s Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {doctorStats?.pendingReviews || 0}
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
                {doctorStats?.totalPatients || 0}
              </p>
              <p className="text-sm">Total Patients</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card p-4 rounded-lg md:w-1/2 shadow-md border">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {doctorStats?.patientSatisfaction || 0}%
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
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
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
                      {getRelativeTime(activity.time)}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(activity.priority)}>
                    {activity.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activities to display.
              </p>
            )}
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
              <Link href="/doctor/patients">
                <Users className="mr-2 h-4 w-4" />
                View Patients
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/doctor/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/doctor/medical-records">
                <FileText className="mr-2 h-4 w-4" />
                Medical Records
              </Link>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/doctor/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
                {doctorStats && doctorStats.unreadMessages > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {doctorStats.unreadMessages}
                  </Badge>
                )}
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
            <Link href="/doctor/appointments">View Full Schedule</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaySchedule && todaySchedule.length > 0 ? (
              todaySchedule.map((item) => (
                <div
                  key={item.appointment.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {item.patient?.name || "Unknown Patient"}
                      </h4>
                      <Badge
                        className={getStatusColor(item.appointment.status)}
                      >
                        {item.appointment.status || "scheduled"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.appointment.appointmentTime
                          ? formatTime(item.appointment.appointmentTime)
                          : "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.appointment.type}
                      </span>
                    </div>
                    {item.appointment.reason && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.appointment.reason}
                      </p>
                    )}
                    {item.patient?.phone && (
                      <p className="text-sm text-gray-500">
                        Phone: {item.patient.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/doctor/appointments/${item.appointment.id}`}
                      >
                        {item.appointment.status === "completed"
                          ? "View Details"
                          : "Manage"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No appointments scheduled for today.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
