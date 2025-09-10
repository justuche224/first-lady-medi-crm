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
  Stethoscope,
  User,
  Calendar,
  FileText,
  Users,
  Star,
  DollarSign,
  GraduationCap,
  Award,
  Building,
} from "lucide-react";

interface Doctor {
  id: number;
  userId: string;
  name: string;
  email: string;
  banned: boolean | null;
  createdAt: Date;
  licenseNumber: string;
  specialty: string;
  departmentId?: number | null;
  departmentName?: string | null;
  yearsOfExperience?: number | null;
  education?: string | null;
  certifications?: string | null;
  consultationFee?: string | null;
  rating?: string | null;
  totalPatients?: number | null;
}

interface DoctorDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
}

export function DoctorDetails({
  open,
  onOpenChange,
  doctor,
}: DoctorDetailsProps) {
  if (!doctor) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRating = (rating: string | null) => {
    if (!rating) return "Not rated";
    return `${parseFloat(rating).toFixed(1)} / 5.0`;
  };

  const formatFee = (fee: string | null) => {
    if (!fee) return "Not set";
    return `$${parseFloat(fee).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctor Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for Dr. {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dr. {doctor.name}</h2>
              <p className="text-muted-foreground">{doctor.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={doctor.banned ? "destructive" : "default"}>
                {doctor.banned ? "Suspended" : "Active"}
              </Badge>
              <Badge variant="outline">{doctor.specialty}</Badge>
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
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">
                      Dr. {doctor.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {doctor.userId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Medical Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">License Number</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {doctor.licenseNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Specialty</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.departmentName || "Not assigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Practice Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRating(doctor.rating)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Patients</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.totalPatients || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Consultation Fee</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFee(doctor.consultationFee)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Years of Experience</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.yearsOfExperience
                        ? `${doctor.yearsOfExperience} years`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(doctor.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(doctor.education || doctor.certifications) && (
            <>
              <Separator />
              <div className="space-y-4">
                {doctor.education && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </h3>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {doctor.education}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {doctor.certifications && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5" />
                      Certifications
                    </h3>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {doctor.certifications}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
