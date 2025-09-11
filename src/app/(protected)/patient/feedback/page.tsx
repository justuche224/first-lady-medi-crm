import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getFeedback } from "@/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  User,
  Calendar,
  Clock,
  Send,
  Search,
  Filter,
  Plus,
  Star,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SearchParams {
  page?: string;
  type?: string;
  status?: string;
  search?: string;
}

const FeedbackPage = async ({
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
  const status = (await searchParams).status || "all";
  const search = (await searchParams).search || "";

  // Get feedback data
  const feedbackResult = await getFeedback(
    page,
    20,
    type === "all" ? undefined : type,
    status === "all" ? undefined : status
  );

  if (!feedbackResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading feedback: {feedbackResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    feedback = [],
    pagination = {
      totalPages: 0,
      page: 1,
      limit: 20,
      total: 0,
      hasPrev: false,
      hasNext: false,
    },
  } = feedbackResult;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "complaint":
        return "bg-red-100 text-red-800 border-red-200";
      case "suggestion":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "praise":
        return "bg-green-100 text-green-800 border-green-200";
      case "inquiry":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
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
      case "complaint":
        return <AlertTriangle className="h-4 w-4" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />;
      case "praise":
        return <ThumbsUp className="h-4 w-4" />;
      case "inquiry":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-3 w-3" />;
      case "in_progress":
        return <Clock className="h-3 w-3" />;
      case "resolved":
        return <CheckCircle className="h-3 w-3" />;
      case "closed":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      </div>
    );
  };

  // Filter feedback for stats
  const openFeedback = feedback.filter((fb) => fb.feedback.status === "open");
  const resolvedFeedback = feedback.filter(
    (fb) => fb.feedback.status === "resolved"
  );
  const praiseFeedback = feedback.filter((fb) => fb.feedback.type === "praise");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Feedback & Support</h1>
              <p className="text-amber-100 mt-1">
                Share your experience and get support from our team
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Submit New Feedback</DialogTitle>
                <DialogDescription>
                  Help us improve our services by sharing your feedback,
                  suggestions, or concerns.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="praise">Praise</SelectItem>
                      <SelectItem value="inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your feedback"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="message" className="text-right mt-2">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide detailed information about your feedback..."
                    className="col-span-3 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right">
                    Rating
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 text-gray-300 cursor-pointer hover:text-yellow-400"
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        (Optional)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search feedback..."
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
                  <SelectItem value="complaint">Complaints</SelectItem>
                  <SelectItem value="suggestion">Suggestions</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                  <SelectItem value="inquiry">Inquiries</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={status}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
              <MessageCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {feedback.length}
                </p>
                <p className="text-sm text-gray-600">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {openFeedback.length}
                </p>
                <p className="text-sm text-gray-600">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {resolvedFeedback.length}
                </p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {praiseFeedback.length}
                </p>
                <p className="text-sm text-gray-600">Praise</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      {feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card
              key={item.feedback.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        item.feedback.type === "complaint"
                          ? "bg-red-100"
                          : item.feedback.type === "suggestion"
                          ? "bg-blue-100"
                          : item.feedback.type === "praise"
                          ? "bg-green-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {getTypeIcon(item.feedback.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {item.feedback.subject}
                        </h3>
                        <Badge className={getTypeColor(item.feedback.type)}>
                          <span className="capitalize">
                            {item.feedback.type}
                          </span>
                        </Badge>
                        <Badge
                          className={getStatusColor(
                            item.feedback.status || "open"
                          )}
                        >
                          {getStatusIcon(item.feedback.status || "open")}
                          <span className="ml-1 capitalize">
                            {item.feedback.status?.replace("_", " ")}
                          </span>
                        </Badge>
                        <Badge
                          className={getPriorityColor(
                            item.feedback.priority || "normal"
                          )}
                        >
                          {item.feedback.priority?.toUpperCase() || "NORMAL"}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mb-3">
                        {item.feedback.message}
                      </p>

                      {/* Rating */}
                      {item.feedback.rating && (
                        <div className="mb-3">
                          {renderStars(item.feedback.rating)}
                        </div>
                      )}

                      {/* Response */}
                      {item.feedback.response && (
                        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-1">
                            Response
                          </h4>
                          <p className="text-green-700 text-sm">
                            {item.feedback.response}
                          </p>
                          {item.assignedUser && (
                            <div className="flex items-center space-x-2 mt-2 text-xs text-green-600">
                              <User className="h-3 w-3" />
                              <span>Responded by {item.assignedUser.name}</span>
                              {item.feedback.respondedAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {formatDate(
                                      item.feedback.respondedAt.toISOString()
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Department */}
                      {item.department && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span>Assigned to: {item.department.name}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Submitted{" "}
                            {formatDate(item.feedback.createdAt.toISOString())}
                          </span>
                        </div>
                        {item.feedback.updatedAt &&
                          item.feedback.updatedAt.toISOString() !==
                            item.feedback.createdAt.toISOString() && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Updated{" "}
                                {formatDate(
                                  item.feedback.updatedAt.toISOString()
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {item.feedback.status === "open" && (
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    )}
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
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No feedback submitted yet
              </h3>
              <p className="text-gray-600 mb-4">
                Share your experience with our healthcare services. Your
                feedback helps us improve.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your First Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Submit New Feedback</DialogTitle>
                    <DialogDescription>
                      Help us improve our services by sharing your feedback,
                      suggestions, or concerns.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Same form content as above */}
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
            {pagination.total} feedback items
          </p>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    pagination.page - 1
                  }&type=${type}&status=${status}`}
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
                  }&type=${type}&status=${status}`}
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

export default FeedbackPage;
