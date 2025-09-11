import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
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
import Link from "next/link";
import { getAppointments } from "@/actions";

const DoctorAppointmentsPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "doctor") {
    redirect("/dashboard");
  }

  // Fetch live appointments data
  const appointmentsResult = await getAppointments(1, 100); // Get first 100 appointments

  if (!appointmentsResult.success) {
    console.error("Error loading appointments:", appointmentsResult.error);
  }

  const appointmentsData = appointmentsResult.success
    ? appointmentsResult.appointments
    : [];

  // Transform the data to match the expected format
  const appointments = (appointmentsData || []).map((item) => {
    const appointment = item.appointment;
    const patient = item.patient;

    const formatTime = (timeString: string) => {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    return {
      id: appointment.id,
      patient: {
        id: patient?.id || 0,
        name: patient?.name || "Unknown Patient",
        age: null, // Age calculation would need dateOfBirth from patient table
        image: null,
      },
      date: appointment.appointmentDate,
      time: formatTime(appointment.appointmentTime),
      duration: appointment.duration || 30,
      type: appointment.type,
      status: appointment.status || "scheduled",
      reason: appointment.reason || "Consultation",
      notes: appointment.notes,
      symptoms: appointment.symptoms,
      priority: "normal", // Priority field doesn't exist in appointments schema
    };
  });

  const todayAppointments = appointments.filter(
    (apt) => apt.date === "2024-01-18"
  );
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) > new Date("2024-01-18")
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-orange-100 text-orange-800";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const stats = {
    todayTotal: todayAppointments.length,
    todayCompleted: todayAppointments.filter(
      (apt) => apt.status === "completed"
    ).length,
    upcomingTotal: upcomingAppointments.length,
    urgentCases: appointments.filter(
      (apt) => apt.priority === "urgent" && apt.status !== "completed"
    ).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Appointments</h1>
              <p className="text-blue-100 mt-1">
                Manage your schedule and patient appointments
              </p>
            </div>
          </div>
          <Button variant="secondary" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.todayTotal}
                </p>
                <p className="text-sm text-gray-600">
                  Today&apos;s Appointments
                </p>
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
                  {stats.todayCompleted}
                </p>
                <p className="text-sm text-gray-600">Completed Today</p>
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
                  {stats.upcomingTotal}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
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
                  {stats.urgentCases}
                </p>
                <p className="text-sm text-gray-600">Urgent Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>
                Your appointments for {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      appointment.priority === "urgent"
                        ? "border-red-200 bg-red-50"
                        : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarImage src={appointment.patient.image || ""} />
                        <AvatarFallback>
                          {appointment.patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {appointment.patient.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {appointment.priority === "urgent" && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time} ({appointment.duration} min)
                        </span>
                        <span className="text-sm text-gray-600">
                          {appointment.type}
                        </span>
                        <span
                          className={`text-sm ${getPriorityColor(
                            appointment.priority
                          )}`}
                        >
                          {appointment.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {appointment.reason}
                      </p>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-500">
                          Symptoms: {appointment.symptoms}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/doctor/appointments/${appointment.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      {appointment.status !== "completed" && (
                        <Button size="sm">Start Visit</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Future scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={appointment.patient.image || ""}
                              />
                              <AvatarFallback>
                                {appointment.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {appointment.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.patient.age} years
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.date}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.time}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {appointment.reason}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center ${getPriorityColor(
                              appointment.priority
                            )}`}
                          >
                            {appointment.priority === "urgent" && (
                              <AlertTriangle className="h-4 w-4 mr-1" />
                            )}
                            <span className="capitalize">
                              {appointment.priority}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/doctor/appointments/${appointment.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
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

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Appointments</CardTitle>
              <CardDescription>
                Recently completed patient visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={appointment.patient.image || ""}
                              />
                              <AvatarFallback>
                                {appointment.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {appointment.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.patient.age} years
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.date}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.time}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{appointment.duration} minutes</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/doctor/appointments/${appointment.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Notes
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>
                Complete appointment history and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="physical-exam">Physical Exam</SelectItem>
                    <SelectItem value="urgent-care">Urgent Care</SelectItem>
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
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={appointment.patient.image || ""}
                              />
                              <AvatarFallback>
                                {appointment.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {appointment.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.patient.age} years
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.date}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.time}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {appointment.reason}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center ${getPriorityColor(
                              appointment.priority
                            )}`}
                          >
                            {appointment.priority === "urgent" && (
                              <AlertTriangle className="h-4 w-4 mr-1" />
                            )}
                            <span className="capitalize">
                              {appointment.priority}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/doctor/appointments/${appointment.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            {appointment.status !== "completed" && (
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
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
  );
};

export default DoctorAppointmentsPage;
