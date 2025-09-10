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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";

interface Patient {
  id: number;
  userId: string;
  name: string;
  email: string;
  banned: boolean | null;
  createdAt: Date;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  healthScore?: number | null;
}

interface PatientDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export function PatientDetails({
  open,
  onOpenChange,
  patient,
}: PatientDetailsProps) {
  if (!patient) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} years old`;
  };

  const getHealthScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for {patient.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <p className="text-muted-foreground">{patient.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={patient.banned ? "destructive" : "default"}>
                {patient.banned ? "Banned" : "Active"}
              </Badge>
              <Badge className={getHealthScoreColor(patient.healthScore || 0)}>
                Health Score: {patient.healthScore || 0}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.dateOfBirth
                        ? formatDate(patient.dateOfBirth)
                        : "Not provided"}
                      {patient.dateOfBirth &&
                        ` (${calculateAge(patient.dateOfBirth)})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.gender || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Blood Type</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.bloodType || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contact Name</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.emergencyContact || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contact Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.emergencyPhone || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Provider</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.insuranceProvider || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Policy Number</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.insuranceNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(patient.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(patient.allergies || patient.medicalHistory) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Information
                </h3>

                {patient.allergies && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Allergies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {patient.allergies}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {patient.medicalHistory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Medical History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {patient.medicalHistory}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
