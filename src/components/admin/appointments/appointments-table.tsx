"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  User,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AppointmentDetails } from "./appointment-details";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number | null;
  type: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
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
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  onRefresh: () => void;
}

export function AppointmentsTable({
  appointments,
  onRefresh,
}: AppointmentsTableProps) {
  const [viewingAppointment, setViewingAppointment] =
    useState<Appointment | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-3 w-3" />;
      case "confirmed":
        return <Calendar className="h-3 w-3" />;
      case "completed":
        return <Calendar className="h-3 w-3" />;
      case "cancelled":
        return <Calendar className="h-3 w-3" />;
      case "no_show":
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {appointment.patientName ||
                            `Patient #${appointment.patientId}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {appointment.patientId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {appointment.doctorName ||
                            `Doctor #${appointment.doctorId}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {appointment.doctorId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(appointment.appointmentTime)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{appointment.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace("_", " ")}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {appointment.reason || "No reason provided"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setViewingAppointment(appointment)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AppointmentDetails
        open={!!viewingAppointment}
        onOpenChange={(open) => !open && setViewingAppointment(null)}
        appointment={viewingAppointment}
      />
    </>
  );
}
