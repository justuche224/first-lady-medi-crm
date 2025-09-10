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
import { Building, User, Calendar, FileText, Users } from "lucide-react";

interface Department {
  id: number;
  name: string;
  description?: string | null;
  headDoctorId?: string | null;
  headDoctorName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function DepartmentDetails({
  open,
  onOpenChange,
  department,
}: DepartmentDetailsProps) {
  if (!department) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for {department.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{department.name}</h2>
              <p className="text-muted-foreground">
                Department ID: {department.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={department.headDoctorId ? "default" : "secondary"}
              >
                {department.headDoctorId ? "Complete" : "Needs Leadership"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {department.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {department.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Head Doctor</p>
                    <p className="text-sm text-muted-foreground">
                      {department.headDoctorName || "Not assigned"}
                    </p>
                  </div>
                </div>

                {department.headDoctorId && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Doctor ID</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {department.headDoctorId}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(department.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(department.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Department Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Leadership Status
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        department.headDoctorId
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {department.headDoctorId ? "Complete" : "Needs Head"}
                    </p>
                  </div>
                  <Building
                    className={`h-8 w-8 ${
                      department.headDoctorId
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {department.description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Department Description
                </h3>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {department.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
