import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Reply,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DoctorFeedbackPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  // Mock feedback data
  const feedback = [
    {
      id: 1,
      patient: { id: 1, name: "Sarah Johnson", image: null },
      type: "praise",
      subject: "Excellent Care and Communication",
      message:
        "Dr. Smith was very thorough and explained everything clearly. I felt heard and well cared for.",
      rating: 5,
      status: "open",
      priority: "normal",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      patient: { id: 2, name: "Michael Chen", image: null },
      type: "complaint",
      subject: "Long Wait Time",
      message:
        "Had to wait over an hour past my appointment time. This needs improvement.",
      rating: 2,
      status: "in_progress",
      priority: "high",
      createdAt: "2024-01-14T14:20:00Z",
    },
    {
      id: 3,
      patient: { id: 3, name: "Emma Williams", image: null },
      type: "suggestion",
      subject: "Online Portal Enhancement",
      message:
        "It would be great to have a mobile app for easier access to test results and appointments.",
      rating: 4,
      status: "resolved",
      priority: "normal",
      createdAt: "2024-01-13T09:15:00Z",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "praise":
        return "bg-green-100 text-green-800";
      case "complaint":
        return "bg-red-100 text-red-800";
      case "suggestion":
        return "bg-blue-100 text-blue-800";
      case "inquiry":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 p-6 rounded-xl text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patient Feedback</h1>
            <p className="text-pink-100 mt-1">
              Review and respond to patient feedback
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {feedback.length}
                </p>
                <p className="text-sm text-gray-600">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {feedback.filter((f) => f.status === "open").length}
                </p>
                <p className="text-sm text-gray-600">Pending Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-500">
                  {(
                    feedback.reduce((sum, f) => sum + f.rating, 0) /
                    feedback.length
                  ).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {feedback.filter((f) => f.status === "resolved").length}
                </p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="praise">Praise</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Patient Feedback</CardTitle>
              <CardDescription>
                Complete feedback history from patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search feedback..." className="pl-10" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <Avatar>
                      <AvatarImage src={item.patient.image || ""} />
                      <AvatarFallback>
                        {item.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{item.subject}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(item.type)}>
                            {item.type}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        From: {item.patient.name} |{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {item.message}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-2">
                          Rating:
                        </span>
                        <div className="flex">{renderStars(item.rating)}</div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Reply className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Responses</CardTitle>
              <CardDescription>
                Feedback requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback
                  .filter((f) => f.status === "open")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                    >
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.subject}</h4>
                        <p className="text-sm text-gray-600">
                          From: {item.patient.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {item.message}
                        </p>
                      </div>
                      <Button size="sm">Respond Now</Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="praise">
          <Card>
            <CardHeader>
              <CardTitle>Positive Feedback</CardTitle>
              <CardDescription>
                Praise and compliments from patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback
                  .filter((f) => f.type === "praise")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 p-4 border border-green-200 bg-green-50 rounded-lg"
                    >
                      <div className="bg-green-100 p-2 rounded-full">
                        <Star className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.subject}</h4>
                        <p className="text-sm text-gray-600">
                          From: {item.patient.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {item.message}
                        </p>
                        <div className="flex items-center mt-2">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>Complaints</CardTitle>
              <CardDescription>
                Issues and concerns raised by patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback
                  .filter((f) => f.type === "complaint")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 p-4 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.subject}</h4>
                        <p className="text-sm text-gray-600">
                          From: {item.patient.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {item.message}
                        </p>
                        <div className="flex items-center mt-2">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                      <Button size="sm" variant="destructive">
                        Address Issue
                      </Button>
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

export default DoctorFeedbackPage;
