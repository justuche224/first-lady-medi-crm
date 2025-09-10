"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  Shield,
  ShieldX,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DoctorForm } from "./doctor-form";
import { DoctorDetails } from "./doctor-details";
import { deleteDoctor, toggleDoctorBan } from "@/actions/doctor-actions";
import { toast } from "sonner";

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

interface DoctorsTableProps {
  doctors: Doctor[];
  onRefresh: () => void;
}

export function DoctorsTable({ doctors, onRefresh }: DoctorsTableProps) {
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [banningDoctor, setBanningDoctor] = useState<Doctor | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingDoctor) return;

    setIsLoading(true);
    try {
      const result = await deleteDoctor(deletingDoctor.id);
      if (result.success) {
        toast.success("Doctor deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete doctor");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setDeletingDoctor(null);
    }
  };

  const handleBanToggle = async () => {
    if (!banningDoctor) return;

    setIsLoading(true);
    try {
      const result = await toggleDoctorBan(
        banningDoctor.id,
        !banningDoctor.banned,
        !banningDoctor.banned ? banReason : undefined
      );
      if (result.success) {
        toast.success(
          banningDoctor.banned
            ? "Doctor unbanned successfully"
            : "Doctor banned successfully"
        );
        onRefresh();
      } else {
        toast.error(result.error || "Failed to update doctor status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setBanningDoctor(null);
      setBanReason("");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatRating = (rating: string | null) => {
    if (!rating) return "N/A";
    return parseFloat(rating).toFixed(1);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doctor.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    {doctor.departmentName || (
                      <span className="text-muted-foreground text-sm">
                        No department
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {doctor.yearsOfExperience ? (
                      `${doctor.yearsOfExperience} years`
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {formatRating(doctor.rating)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.banned ? "destructive" : "default"}>
                      {doctor.banned ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doctor.createdAt)}</TableCell>
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
                          onClick={() => setViewingDoctor(doctor)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingDoctor(doctor)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setBanningDoctor(doctor)}
                          className={
                            doctor.banned ? "text-green-600" : "text-orange-600"
                          }
                        >
                          {doctor.banned ? (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Unban Doctor
                            </>
                          ) : (
                            <>
                              <ShieldX className="mr-2 h-4 w-4" />
                              Ban Doctor
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingDoctor(doctor)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      <DoctorForm
        open={!!editingDoctor}
        onOpenChange={(open) => !open && setEditingDoctor(null)}
        doctor={editingDoctor || undefined}
        onSuccess={onRefresh}
      />

      <DoctorDetails
        open={!!viewingDoctor}
        onOpenChange={(open) => !open && setViewingDoctor(null)}
        doctor={viewingDoctor}
      />

      <AlertDialog
        open={!!deletingDoctor}
        onOpenChange={(open) => !open && setDeletingDoctor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Dr. {deletingDoctor?.name}? This
              action cannot be undone and will remove all associated data
              including appointments and medical records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!banningDoctor}
        onOpenChange={(open) => !open && setBanningDoctor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banningDoctor?.banned ? "Unban" : "Ban"} Doctor
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banningDoctor?.banned
                ? `Are you sure you want to restore access for Dr. ${banningDoctor?.name}?`
                : `Are you sure you want to suspend Dr. ${banningDoctor?.name}? They will lose access to the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!banningDoctor?.banned && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Ban Reason</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for banning this doctor..."
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanToggle}
              disabled={
                isLoading || (!banningDoctor?.banned && !banReason.trim())
              }
              className={
                banningDoctor?.banned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {isLoading
                ? "Processing..."
                : banningDoctor?.banned
                ? "Unban Doctor"
                : "Ban Doctor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
