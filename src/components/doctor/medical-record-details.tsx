"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User, Stethoscope, FileText, Clock } from "lucide-react";

interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number | null;
  appointmentId: number | null;
  recordType: string;
  title: string;
  description: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medications: string | null;
  labTests: string | null;
  vitalSigns: string | null;
  attachments: string | null;
  isConfidential: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PatientInfo {
  id: number | null;
  userId: string | null;
  name: string | null;
  dateOfBirth?: Date;
}

interface DoctorInfo {
  id: number | null;
  userId: string | null;
  name: string | null;
  specialty: string | null;
  licenseNumber?: string;
}

interface MedicalRecordWithRelations {
  record: MedicalRecord;
  patient: PatientInfo;
  doctor: DoctorInfo;
  appointment?: {
    id: number;
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    duration: number | null;
    type: string;
    status: string | null;
    reason: string | null;
    symptoms: string | null;
    notes: string | null;
    diagnosis: string | null;
    prescription: string | null;
    followUpRequired: boolean | null;
    followUpDate: string | null;
    cancelledBy: string | null;
    cancelReason: string | null;
    rescheduledFrom: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  total?: number;
}

interface MedicalRecordDetailsProps {
  record: MedicalRecordWithRelations;
  onClose: () => void;
}

export function MedicalRecordDetails({
  record,
  onClose,
}: MedicalRecordDetailsProps) {
  if (!record) return null;

  const { record: medicalRecord, patient, doctor, appointment } = record;

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "diagnosis":
        return "bg-green-100 text-green-800";
      case "treatment":
        return "bg-purple-100 text-purple-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "follow-up":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Record Details</h2>
          <p className="text-gray-600">
            Complete information about this medical record
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Record Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{medicalRecord?.title || "Untitled Record"}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                className={getRecordTypeColor(
                  medicalRecord?.recordType || "consultation"
                )}
              >
                {medicalRecord?.recordType || "consultation"}
              </Badge>
              {medicalRecord?.isConfidential && (
                <Badge variant="destructive">Confidential</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Created:{" "}
                {medicalRecord?.createdAt
                  ? formatDate(medicalRecord.createdAt)
                  : "N/A"}
              </span>
            </div>
            {medicalRecord?.updatedAt && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Updated: {formatDate(medicalRecord.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Patient Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {patient?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {patient?.name || "Unknown Patient"}
              </h3>
              <p className="text-sm text-gray-600">
                Patient ID: {patient?.id || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Date of Birth:{" "}
                {patient?.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Doctor Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {doctor?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "D"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                Dr. {doctor?.name || "Unknown Doctor"}
              </h3>
              <p className="text-sm text-gray-600">
                Specialty: {doctor?.specialty || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                License: {doctor?.licenseNumber || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicalRecord?.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{medicalRecord.description}</p>
            </div>
          )}

          {medicalRecord?.diagnosis && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Diagnosis</h4>
                <p className="text-gray-700">{medicalRecord.diagnosis}</p>
              </div>
            </>
          )}

          {medicalRecord?.treatment && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Treatment</h4>
                <p className="text-gray-700">{medicalRecord.treatment}</p>
              </div>
            </>
          )}

          {medicalRecord?.medications && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Medications</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {medicalRecord.medications}
                  </pre>
                </div>
              </div>
            </>
          )}

          {medicalRecord?.labTests && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Lab Tests</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {medicalRecord.labTests}
                  </pre>
                </div>
              </div>
            </>
          )}

          {medicalRecord?.vitalSigns && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Vital Signs</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {medicalRecord.vitalSigns}
                  </pre>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Appointment Information */}
      {appointment && (
        <Card>
          <CardHeader>
            <CardTitle>Related Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Date:</span>{" "}
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Type:</span> {appointment.type}
              </p>
              {appointment.reason && (
                <p className="text-sm">
                  <span className="font-semibold">Reason:</span>{" "}
                  {appointment.reason}
                </p>
              )}
              <Badge className="mt-2">{appointment.status}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
