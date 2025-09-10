"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

interface AppointmentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function AppointmentDetails({
  open,
  onOpenChange,
  appointment,
}: AppointmentDetailsProps) {
  if (!appointment) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "confirmed":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      case "no_show":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "no_show":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            Appointment #{appointment.id} -{" "}
            {formatDate(appointment.appointmentDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {appointment.type} Appointment
              </h2>
              <p className="text-muted-foreground">
                {formatDate(appointment.appointmentDate)} at{" "}
                {appointment.appointmentTime}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getStatusColor(appointment.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(appointment.status)}
                  {appointment.status.replace("_", " ")}
                </div>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.patientName ||
                        `Patient #${appointment.patientId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {appointment.patientId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Doctor</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctorName ||
                        `Doctor #${appointment.doctorId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Doctor ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {appointment.doctorId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.duration
                        ? `${appointment.duration} minutes`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(appointment.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(appointment.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(appointment.reason ||
            appointment.symptoms ||
            appointment.notes ||
            appointment.diagnosis ||
            appointment.prescription) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clinical Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointment.reason && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Reason for Visit
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {appointment.reason}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {appointment.symptoms && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Symptoms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {appointment.symptoms}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {appointment.diagnosis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Diagnosis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {appointment.diagnosis}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {appointment.prescription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Prescription
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {appointment.prescription}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {appointment.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {appointment.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {appointment.status === "cancelled" && appointment.cancelReason && (
            <>
              <Separator />
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-base text-red-600">
                    Cancellation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {appointment.cancelReason}
                  </p>
                  {appointment.cancelledBy && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Cancelled by: {appointment.cancelledBy}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {appointment.followUpRequired && (
            <>
              <Separator />
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base text-blue-600">
                    Follow-up Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointment.followUpDate && (
                    <p className="text-sm text-muted-foreground">
                      Follow-up scheduled for:{" "}
                      {formatDate(appointment.followUpDate)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
