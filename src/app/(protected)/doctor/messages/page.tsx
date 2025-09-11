import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Send,
  Paperclip,
  Eye,
  Reply,
  AlertTriangle,
  Clock,
  CheckCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DoctorMessagesPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  // Mock messages data - in real app, fetch from database
  const messages = [
    {
      id: 1,
      sender: {
        id: "patient_1",
        name: "Sarah Johnson",
        role: "patient",
        image: null,
      },
      recipient: {
        id: user.id,
        name: user.name,
        role: "doctor",
        image: user.image,
      },
      type: "appointment",
      subject: "Appointment Rescheduling Request",
      message:
        "Hi Dr. Smith, I need to reschedule my appointment on January 25th due to a work conflict. Could we move it to the following week? Thank you.",
      priority: "normal",
      isRead: false,
      sentAt: "2024-01-16T14:30:00Z",
      attachments: [],
      relatedAppointmentId: 1,
    },
    {
      id: 2,
      sender: {
        id: "staff_1",
        name: "Nurse Jennifer",
        role: "staff",
        image: null,
      },
      recipient: {
        id: user.id,
        name: user.name,
        role: "doctor",
        image: user.image,
      },
      type: "medication",
      subject: "Medication Refill Authorization Needed",
      message:
        "Dr. Smith, Michael Chen is requesting a refill for his Metformin prescription. His last refill was on January 1st and he has no remaining refills. Please review and authorize if appropriate.",
      priority: "high",
      isRead: false,
      sentAt: "2024-01-16T11:15:00Z",
      attachments: [],
      relatedAppointmentId: null,
    },
    {
      id: 3,
      sender: {
        id: "patient_3",
        name: "Emma Williams",
        role: "patient",
        image: null,
      },
      recipient: {
        id: user.id,
        name: user.name,
        role: "doctor",
        image: user.image,
      },
      type: "general",
      subject: "Question about Medication Side Effects",
      message:
        "Dear Dr. Smith, I've been taking the Sertraline you prescribed for about a week now, and I'm experiencing some nausea and dizziness. Is this normal? Should I continue taking it or contact you for an appointment?",
      priority: "normal",
      isRead: true,
      sentAt: "2024-01-15T16:45:00Z",
      attachments: [],
      relatedAppointmentId: 3,
    },
    {
      id: 4,
      sender: {
        id: "doctor_2",
        name: "Dr. Anderson",
        role: "doctor",
        image: null,
      },
      recipient: {
        id: user.id,
        name: user.name,
        role: "doctor",
        image: user.image,
      },
      type: "general",
      subject: "Consultation Request - Complex Case",
      message:
        "Hi John, I have a complex cardiac case that I'd like to get your opinion on. 58-year-old male with chest pain, normal EKG, but elevated troponins. Available for a quick consult this week?",
      priority: "high",
      isRead: true,
      sentAt: "2024-01-15T09:20:00Z",
      attachments: ["patient_chart.pdf", "ekg_results.pdf"],
      relatedAppointmentId: null,
    },
    {
      id: 5,
      sender: {
        id: "patient_4",
        name: "Robert Davis",
        role: "patient",
        image: null,
      },
      recipient: {
        id: user.id,
        name: user.name,
        role: "doctor",
        image: user.image,
      },
      type: "urgent",
      subject: "Urgent: Chest Pain Episode",
      message:
        "Dr. Smith, I experienced severe chest pain this morning around 8 AM. It lasted about 10 minutes and subsided. I'm feeling better now but wanted to inform you. Should I come in for an emergency visit?",
      priority: "urgent",
      isRead: false,
      sentAt: "2024-01-16T08:30:00Z",
      attachments: [],
      relatedAppointmentId: 4,
    },
  ];

  const unreadMessages = messages.filter((msg) => !msg.isRead);
  const urgentMessages = messages.filter((msg) => msg.priority === "urgent");
  const appointmentMessages = messages.filter(
    (msg) => msg.type === "appointment"
  );
  const medicationMessages = messages.filter(
    (msg) => msg.type === "medication"
  );

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "medication":
        return "bg-purple-100 text-purple-800";
      case "result":
        return "bg-green-100 text-green-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "general":
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
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "patient":
        return "👤";
      case "doctor":
        return "👨‍⚕️";
      case "staff":
        return "👩‍⚕️";
      default:
        return "👤";
    }
  };

  const stats = {
    totalMessages: messages.length,
    unreadMessages: unreadMessages.length,
    urgentMessages: urgentMessages.length,
    appointmentMessages: appointmentMessages.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-violet-100 mt-1">
                Communicate with patients, staff, and colleagues
              </p>
            </div>
          </div>
          <Button variant="secondary" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalMessages}
                </p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.unreadMessages}
                </p>
                <p className="text-sm text-gray-600">Unread Messages</p>
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
                  {stats.urgentMessages}
                </p>
                <p className="text-sm text-gray-600">Urgent Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.appointmentMessages}
                </p>
                <p className="text-sm text-gray-600">Appointment Related</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="unread" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="all">All Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unread Messages</CardTitle>
                  <CardDescription>
                    Messages requiring your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unreadMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                          message.priority === "urgent"
                            ? "border-red-200 bg-red-50"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <Avatar>
                            <AvatarImage src={message.sender.image || ""} />
                            <AvatarFallback>
                              {message.sender.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {getRoleIcon(message.sender.role)}
                              </span>
                              <h4 className="font-semibold">
                                {message.sender.name}
                              </h4>
                              <Badge
                                className={getMessageTypeColor(message.type)}
                              >
                                {message.type}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              {message.priority === "urgent" && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(message.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900 mt-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.message}
                          </p>
                          {message.attachments.length > 0 && (
                            <div className="flex items-center mt-2">
                              <Paperclip className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {message.attachments.length} attachment(s)
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
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
                  <CardTitle>Urgent Messages</CardTitle>
                  <CardDescription>
                    High priority messages requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {urgentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-4 p-4 border border-red-200 bg-red-50 rounded-lg"
                      >
                        <div className="bg-red-100 p-2 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <Avatar>
                          <AvatarImage src={message.sender.image || ""} />
                          <AvatarFallback>
                            {message.sender.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-red-800">
                              {message.sender.name}
                            </h4>
                            <Badge variant="destructive">URGENT</Badge>
                          </div>
                          <p className="font-medium text-gray-900 mt-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {message.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Received:{" "}
                            {new Date(message.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0 space-x-2">
                          <Button size="sm">Respond Now</Button>
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
                  <CardTitle>Appointment Messages</CardTitle>
                  <CardDescription>
                    Messages related to appointments and scheduling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={message.sender.image || ""} />
                          <AvatarFallback>
                            {message.sender.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              {message.sender.name}
                            </h4>
                            <Badge
                              className={getMessageTypeColor(message.type)}
                            >
                              {message.type}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900 mt-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {message.message}
                          </p>
                        </div>
                        <div className="flex-shrink-0 space-x-2">
                          <Button size="sm" variant="outline">
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medication Messages</CardTitle>
                  <CardDescription>
                    Messages about prescriptions and medication management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicationMessages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={message.sender.image || ""} />
                          <AvatarFallback>
                            {message.sender.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              {message.sender.name}
                            </h4>
                            <Badge
                              className={getMessageTypeColor(message.type)}
                            >
                              {message.type}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900 mt-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {message.message}
                          </p>
                        </div>
                        <div className="flex-shrink-0 space-x-2">
                          <Button size="sm" variant="outline">
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Messages</CardTitle>
                  <CardDescription>Complete message history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search messages..."
                        className="pl-10"
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Message Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="result">Result</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>From</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow
                            key={message.id}
                            className={!message.isRead ? "bg-blue-50" : ""}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={message.sender.image || ""}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {message.sender.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {message.sender.name}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {message.sender.role}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p
                                className={`${
                                  !message.isRead ? "font-semibold" : ""
                                }`}
                              >
                                {message.subject}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getMessageTypeColor(message.type)}
                              >
                                {message.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`capitalize ${getPriorityColor(
                                  message.priority
                                )}`}
                              >
                                {message.priority}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(message.sentAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {message.isRead ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-blue-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Reply className="h-4 w-4 mr-1" />
                                  Reply
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Compose Message */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>Send a new message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient_1">
                      Sarah Johnson (Patient)
                    </SelectItem>
                    <SelectItem value="patient_2">
                      Michael Chen (Patient)
                    </SelectItem>
                    <SelectItem value="staff_1">
                      Nurse Jennifer (Staff)
                    </SelectItem>
                    <SelectItem value="doctor_1">
                      Dr. Anderson (Doctor)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="result">Result</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Message subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Normal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach File
                </Button>
              </div>
              <Button className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessagesPage;
