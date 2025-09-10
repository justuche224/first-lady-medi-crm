/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getMessages } from "@/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  User,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Reply,
  Archive,
  Paperclip,
  AlertTriangle,
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
  search?: string;
}

const MessagesPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  const page = parseInt(searchParams.page || "1");
  const type = searchParams.type || "all";
  const priority = searchParams.priority || "all";
  const search = searchParams.search || "";

  // Get messages data
  const messagesResult = await getMessages(
    page,
    20,
    type === "all"
      ? undefined
      : (type as
          | "appointment"
          | "medication"
          | "result"
          | "urgent"
          | "general"),
    false // unreadOnly parameter
  );

  if (!messagesResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading messages: {messagesResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    messages = [],
    pagination = {
      totalPages: 0,
      page: 1,
      limit: 20,
      total: 0,
      hasPrev: false,
      hasNext: false,
    },
  } = messagesResult;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "medication":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "result":
        return "bg-green-100 text-green-800 border-green-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "general":
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
        return <Calendar className="h-3 w-3" />;
      case "medication":
        return <Paperclip className="h-3 w-3" />;
      case "result":
        return <Clock className="h-3 w-3" />;
      case "urgent":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
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

  // Filter messages for stats
  const unreadMessages = messages?.filter((msg) => !msg.message.isRead);
  const urgentMessages = messages.filter(
    (msg) => msg.message.priority === "urgent"
  );
  const appointmentMessages = messages?.filter(
    (msg) => msg.message.type === "appointment"
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-indigo-100 mt-1">
                Communicate with your healthcare providers
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {/* Urgent Messages Alert */}
      {urgentMessages.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Urgent Messages</h3>
                <p className="text-sm text-red-700 mt-1">
                  You have {urgentMessages.length} urgent message(s) that
                  require immediate attention.
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
                  placeholder="Search messages..."
                  className="pl-10"
                  defaultValue={search}
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
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="result">Results</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={priority}>
                <SelectTrigger className="w-[150px]">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-600">
                  {messages?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Total Messages</p>
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
                  {unreadMessages?.length || 0}
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
                  {urgentMessages?.length || 0}
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
                  {appointmentMessages?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      {messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((item: any) => (
            <Card
              key={item.message.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                !item.message.isRead ? "bg-blue-50/50 border-blue-200" : ""
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.sender?.name || "Healthcare Provider"}
                        </h4>
                        {!item.message.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          className={getTypeColor(
                            item.message.type || "general"
                          )}
                        >
                          {getTypeIcon(item.message.type || "general")}
                          <span className="ml-1 capitalize">
                            {item.message.type || "general"}
                          </span>
                        </Badge>
                        <Badge
                          className={getPriorityColor(
                            item.message.priority || "normal"
                          )}
                        >
                          {item.message.priority?.toUpperCase() || "NORMAL"}
                        </Badge>
                      </div>

                      {item.message.subject && (
                        <h5 className="font-medium text-gray-800 mb-1 truncate">
                          {item.message.subject}
                        </h5>
                      )}

                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {item.message.message}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(item.message.createdAt.toISOString())}
                          </span>
                        </div>
                        {item.message.relatedAppointmentId && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Related to appointment</span>
                          </div>
                        )}
                        {item.message.attachments && (
                          <div className="flex items-center space-x-1">
                            <Paperclip className="h-3 w-3" />
                            <span>Has attachments</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 ml-4">
                    <Button variant="outline" size="sm">
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                    {!item.message.isRead && (
                      <Button variant="ghost" size="sm">
                        Mark as Read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages found
              </h3>
              <p className="text-gray-600 mb-4">
                Your messages from healthcare providers will appear here.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Send Your First Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} messages
          </p>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    pagination.page - 1
                  }&type=${type}&priority=${priority}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    pagination.page + 1
                  }&type=${type}&priority=${priority}`}
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

export default MessagesPage;
