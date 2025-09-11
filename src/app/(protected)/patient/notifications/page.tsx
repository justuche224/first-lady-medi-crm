import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notifications} from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pill,
  TestTube,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Trash2,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface SearchParams {
  page?: string;
  type?: string;
  priority?: string;
  read?: string;
}

const NotificationsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  const page = parseInt((await searchParams).page || "1");
  const type = (await searchParams).type || "all";
  const priority = (await searchParams).priority || "all";
  const readFilter = (await searchParams).read || "all";

  // Get notifications data
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build where clause
  let whereClause = sql`${notifications.userId} = ${user.id}`;

  if (type !== "all") {
    whereClause = sql`${whereClause} AND ${notifications.type} = ${type}`;
  }

  if (priority !== "all") {
    whereClause = sql`${whereClause} AND ${notifications.priority} = ${priority}`;
  }

  if (readFilter === "unread") {
    whereClause = sql`${whereClause} AND ${notifications.isRead} = false`;
  } else if (readFilter === "read") {
    whereClause = sql`${whereClause} AND ${notifications.isRead} = true`;
  }

  // Get notifications with count
  const notificationsWithCount = await db
    .select({
      notification: notifications,
      total: sql<number>`count(*) over()`,
    })
    .from(notifications)
    .where(whereClause)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const total = notificationsWithCount[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const notificationsList = notificationsWithCount.map(
    (item) => item.notification
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "medication":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "result":
        return "bg-green-100 text-green-800 border-green-200";
      case "message":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "system":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "normal":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "result":
        return <TestTube className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Filter notifications for stats
  const unreadNotifications = notificationsList.filter(
    (notif) => !notif.isRead
  );
  const urgentNotifications = notificationsList.filter(
    (notif) => notif.priority === "urgent"
  );
  const appointmentNotifications = notificationsList.filter(
    (notif) => notif.type === "appointment"
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Bell className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-violet-100 mt-1">
                Stay updated with important alerts and reminders
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
            <Button variant="secondary" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Urgent Notifications Alert */}
      {urgentNotifications.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">
                  Urgent Notifications
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  You have {urgentNotifications.length} urgent notification(s)
                  that require immediate attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue={type}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="medication">Medications</SelectItem>
                  <SelectItem value="result">Results</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={priority}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={readFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-violet-600" />
              <div>
                <p className="text-2xl font-bold text-violet-600">
                  {notificationsList.length}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {unreadNotifications.length}
                </p>
                <p className="text-sm text-gray-600">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {urgentNotifications.length}
                </p>
                <p className="text-sm text-gray-600">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {appointmentNotifications.length}
                </p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      {notificationsList.length > 0 ? (
        <div className="space-y-2">
          {notificationsList.map((notification) => {
            const expired = isExpired(notification?.expiresAt?.toISOString() || null);

            return (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.isRead ? "bg-blue-50/50 border-blue-200" : ""
                } ${expired ? "opacity-60" : ""}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`p-2 rounded-full ${
                          notification.type === "appointment"
                            ? "bg-blue-100"
                            : notification.type === "medication"
                            ? "bg-purple-100"
                            : notification.type === "result"
                            ? "bg-green-100"
                            : notification.type === "message"
                            ? "bg-indigo-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          {expired && (
                            <Badge variant="outline" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getTypeColor(notification.type)}>
                            <span className="capitalize">
                              {notification.type}
                            </span>
                          </Badge>
                          <Badge
                            className={getPriorityColor(
                              notification.priority || "normal"
                            )}
                          >
                            {notification.priority?.toUpperCase() || "NORMAL"}
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDate(notification.createdAt.toISOString())}
                            </span>
                          </div>
                          {notification.expiresAt && !expired && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>
                                Expires {formatDate(notification.expiresAt?.toISOString())}
                              </span>
                            </div>
                          )}
                          {notification.readAt && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                Read{" "}
                                {formatDate(notification.readAt.toISOString())}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1 ml-4">
                      {notification.actionUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={notification.actionUrl}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      )}
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 mb-4">
                You&apos;re all caught up! New notifications will appear here when
                they arrive.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}{" "}
            notifications
          </p>
          <div className="flex space-x-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    page - 1
                  }&type=${type}&priority=${priority}&read=${readFilter}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    page + 1
                  }&type=${type}&priority=${priority}&read=${readFilter}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
