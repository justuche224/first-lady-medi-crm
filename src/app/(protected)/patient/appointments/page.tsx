import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAppointments } from "@/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Plus,
  Filter,
  Search,
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
  status?: string;
  search?: string;
}

const AppointmentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  const page = parseInt((await searchParams).page || "1");
  const status = (await searchParams).status || "all";
  const search = (await searchParams).search || "";

  // Get appointments data
  const appointmentsResult = await getAppointments(
    page,
    20,
    status === "all" ? undefined : status
  );

  if (!appointmentsResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading appointments: {appointmentsResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    appointments = [],
    pagination = {
      totalPages: 0,
      page: 1,
      limit: 20,
      total: 0,
      hasPrev: false,
      hasNext: false,
    },
  } = appointmentsResult;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no_show":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-3 w-3" />;
      case "confirmed":
        return <Clock className="h-3 w-3" />;
      case "completed":
        return <FileText className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const upcomingAppointments = appointments.filter(
    (apt) =>
      apt.appointment.status === "scheduled" ||
      apt.appointment.status === "confirmed"
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      apt.appointment.status === "completed" ||
      apt.appointment.status === "cancelled" ||
      apt.appointment.status === "no_show"
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Appointments</h1>
              <p className="text-blue-100 mt-1">
                Manage your medical appointments and consultations
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/patient/appointments/book">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
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
                  placeholder="Search appointments..."
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>
            <Select defaultValue={status}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {upcomingAppointments.length}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {
                    appointments.filter(
                      (apt) => apt.appointment.status === "confirmed"
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    appointments.filter(
                      (apt) => apt.appointment.status === "completed"
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(appointments.map((apt) => apt.doctor?.id)).size}
                </p>
                <p className="text-sm text-gray-600">Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Upcoming Appointments</span>
            </CardTitle>
            <CardDescription>
              Your scheduled and confirmed appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((item) => (
                <div
                  key={item.appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {item.doctor?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.doctor?.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatDate(item.appointment.appointmentDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatTime(item.appointment.appointmentTime)}
                            </span>
                            <span className="text-gray-400">
                              ({item.appointment.duration || 30} min)
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="capitalize">
                              {item.appointment.type}
                            </span>
                          </div>
                          {item.appointment.reason && (
                            <div className="flex items-start space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">
                                {item.appointment.reason}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.appointment.symptoms && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm">
                            <span className="font-medium text-orange-800">
                              Symptoms:{" "}
                            </span>
                            <span className="text-orange-700">
                              {item.appointment.symptoms}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        className={getStatusColor(
                          item.appointment.status || ""
                        )}
                      >
                        {getStatusIcon(item.appointment.status || "")}
                        <span className="ml-1 capitalize">
                          {item.appointment.status}
                        </span>
                      </Badge>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span>Past Appointments</span>
            </CardTitle>
            <CardDescription>
              Your completed and cancelled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.map((item) => (
                <div
                  key={item.appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.doctor?.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.doctor?.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatDate(item.appointment.appointmentDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {formatTime(item.appointment.appointmentTime)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="capitalize">
                              {item.appointment.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.appointment.diagnosis && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm">
                            <span className="font-medium text-blue-800">
                              Diagnosis:{" "}
                            </span>
                            <span className="text-blue-700">
                              {item.appointment.diagnosis}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        className={getStatusColor(
                          item.appointment.status || ""
                        )}
                      >
                        {getStatusIcon(item.appointment.status || "")}
                        <span className="ml-1 capitalize">
                          {item.appointment.status}
                        </span>
                      </Badge>

                      {item.appointment.status === "completed" && (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-600 mb-4">
                You don&apos;t have any appointments yet. Book your first
                appointment to get started.
              </p>
              <Button asChild>
                <Link href="/patient/appointments/book">
                  <Plus className="mr-2 h-4 w-4" />
                  Book Your First Appointment
                </Link>
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
            {pagination.total} appointments
          </p>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page - 1}&status=${status}`}>
                  Previous
                </Link>
              </Button>
            )}
            {pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page + 1}&status=${status}`}>
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

export default AppointmentsPage;
