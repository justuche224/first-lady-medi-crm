"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { AppointmentsTable } from "@/components/admin/appointments/appointments-table";
import { getAppointments } from "@/actions/appointment-actions";
import { toast } from "sonner";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number | null;
  type: string;
  status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show"
    | null;
  reason?: string | null;
  symptoms?: string | null;
  notes?: string | null;
  diagnosis?: string | null;
  prescription?: string | null;
  followUpRequired?: boolean | null;
  followUpDate?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  rescheduledFrom?: number | null;
  createdAt: Date;
  updatedAt: Date;
  patientName?: string;
  doctorName?: string;
  total?: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiAppointmentResponse {
  appointment: Appointment;
  patient?: {
    id: number;
    userId: number;
    name: string;
    email: string;
  };
  doctor?: {
    id: number;
    userId: number;
    name: string;
    specialty?: string;
  };
  total: number;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadAppointments = useCallback(
    async (page = currentPage, search = searchTerm) => {
      console.log(search);
      setIsLoading(true);
      try {
        const result = await getAppointments(
          page,
          pageSize,
          statusFilter === "all" ? undefined : statusFilter
        );
        if (result.success) {
          const transformedAppointments = (result.appointments || []).map(
            // @ts-expect-error - ignore type error
            (item: ApiAppointmentResponse) => ({
              ...item.appointment,
              patientName: item.patient?.name || "Unknown Patient",
              doctorName: item.doctor?.name || "Unknown Doctor",
            })
          );
          setAppointments(transformedAppointments);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          toast.error(result.error || "Failed to load appointments");
        }
      } catch {
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, searchTerm, statusFilter]
  );

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadAppointments(1, searchTerm);
  };

  const handleRefresh = () => {
    loadAppointments();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    setCurrentPage(1);
  };

  const getStats = () => {
    const totalAppointments = pagination.total;
    const scheduledCount = appointments.filter(
      (a) => a.status === "scheduled" || a.status === "confirmed"
    ).length;
    const completedCount = appointments.filter(
      (a) => a.status === "completed"
    ).length;
    const cancelledCount = appointments.filter(
      (a) => a.status === "cancelled" || a.status === "no_show"
    ).length;

    return {
      total: totalAppointments,
      scheduled: scheduledCount,
      completed: completedCount,
      cancelled: cancelledCount,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all system appointments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.scheduled}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              Cancelled or no-show
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Search
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="w-[150px]"
              />

              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading appointments...</span>
            </div>
          ) : (
            <>
              <AppointmentsTable
                // @ts-expect-error - ignore type error
                appointments={appointments}
                onRefresh={handleRefresh}
              />

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} appointments
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
