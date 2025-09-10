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
  Building,
  Calendar,
  DollarSign,
  Clock,
  UserCheck,
  Badge as BadgeIcon,
} from "lucide-react";

interface Staff {
  id: number;
  userId: string;
  name: string;
  email: string;
  banned: boolean | null;
  createdAt: Date;
  employeeId: string;
  position: string;
  hireDate: string;
  salary?: string | null;
  supervisorId?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
}

interface StaffDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
}

export function StaffDetails({ open, onOpenChange, staff }: StaffDetailsProps) {
  if (!staff) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = (salary?: string) => {
    if (!salary) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(salary));
  };

  const calculateTenure = (hireDate: string) => {
    const today = new Date();
    const hire = new Date(hireDate);
    const diffTime = Math.abs(today.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} and ${months} month${
        months > 1 ? "s" : ""
      }`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Staff Member Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for {staff.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{staff.name}</h2>
              <p className="text-muted-foreground">{staff.position}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={staff.banned ? "destructive" : "default"}>
                {staff.banned ? "Banned" : "Active"}
              </Badge>
              <Badge variant="outline">ID: {staff.employeeId}</Badge>
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
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {staff.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BadgeIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Employee ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {staff.employeeId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Position</p>
                    <p className="text-sm text-muted-foreground">
                      {staff.position}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">
                      {staff.departmentName || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSalary(staff.salary || undefined)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Employment Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Hire Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(staff.hireDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tenure</p>
                    <p className="text-sm text-muted-foreground">
                      {calculateTenure(staff.hireDate)}
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
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(staff.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {staff.userId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Employment Status
                    </p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Years of Service
                    </p>
                    <p className="text-2xl font-bold">
                      {Math.floor(
                        (Date.now() - new Date(staff.hireDate).getTime()) /
                          (1000 * 60 * 60 * 24 * 365)
                      )}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Account Status
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        staff.banned ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {staff.banned ? "Banned" : "Active"}
                    </p>
                  </div>
                  <BadgeIcon
                    className={`h-8 w-8 ${
                      staff.banned ? "text-red-600" : "text-green-600"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
