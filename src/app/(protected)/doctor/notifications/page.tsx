import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  Calendar,
  TestTube,
  Pill,
  MessageSquare,
  Clock,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DoctorNotificationsPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "appointment",
      title: "Appointment Reminder",
      message: "You have an appointment with Sarah Johnson in 30 minutes",
      priority: "high",
      isRead: false,
      createdAt: "2024-01-18T08:30:00Z",
      actionUrl: "/doctor/appointments/1",
    },
    {
      id: 2,
      type: "result",
      title: "Lab Results Available",
      message: "Lab results for Michael Chen are ready for review",
      priority: "normal",
      isRead: false,
      createdAt: "2024-01-18T07:45:00Z",
      actionUrl: "/doctor/lab-results",
    },
    {
      id: 3,
      type: "medication",
      title: "Medication Refill Request",
      message: "Emma Williams has requested a refill for Sertraline",
      priority: "normal",
      isRead: true,
      createdAt: "2024-01-17T16:20:00Z",
      actionUrl: "/doctor/medications",
    },
    {
      id: 4,
      type: "message",
      title: "New Patient Message",
      message: "Robert Davis sent you a message about chest pain",
      priority: "urgent",
      isRead: false,
      createdAt: "2024-01-17T14:15:00Z",
      actionUrl: "/doctor/messages",
    },
    {
      id: 5,
      type: "system",
      title: "System Update",
      message:
        "Electronic health records system will undergo maintenance tonight",
      priority: "normal",
      isRead: true,
      createdAt: "2024-01-17T09:00:00Z",
      actionUrl: null,
    },
  ];

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const urgentNotifications = notifications.filter(
    (n) => n.priority === "urgent"
  );
  const appointmentNotifications = notifications.filter(
    (n) => n.type === "appointment"
  );
  const resultNotifications = notifications.filter((n) => n.type === "result");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "result":
        return <TestTube className="h-5 w-5 text-green-600" />;
      case "medication":
        return <Pill className="h-5 w-5 text-purple-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "result":
        return "bg-green-100 text-green-800";
      case "medication":
        return "bg-purple-100 text-purple-800";
      case "message":
        return "bg-orange-100 text-orange-800";
      case "system":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "normal":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Bell className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-amber-100 mt-1">
                Stay updated with important alerts and reminders
              </p>
            </div>
          </div>
          <Button variant="secondary">Mark All as Read</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </p>
                <p className="text-sm text-gray-600">Total Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">
                  {unreadNotifications.length}
                </p>
                <p className="text-sm text-gray-600">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">
                  {urgentNotifications.length}
                </p>
                <p className="text-sm text-gray-600">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">
                  {appointmentNotifications.length}
                </p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Complete notification history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
                      !notification.isRead
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-semibold ${
                            !notification.isRead ? "text-blue-900" : ""
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          {notification.priority === "urgent" && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-xs ${getPriorityColor(
                              notification.priority
                            )}`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {notification.actionUrl && (
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>
                Notifications requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 border border-blue-200 bg-blue-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm">Mark as Read</Button>
                      {notification.actionUrl && (
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Notifications</CardTitle>
              <CardDescription>
                High priority notifications requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urgentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-red-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button size="sm" variant="destructive">
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Notifications</CardTitle>
              <CardDescription>
                Reminders and updates about appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button size="sm" variant="outline">
                        View Appointment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Result Notifications</CardTitle>
              <CardDescription>
                Alerts about new lab results and test reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resultNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-green-100 p-2 rounded-full">
                      <TestTube className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button size="sm" variant="outline">
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorNotificationsPage;
