"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Eye,
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
import { PatientForm } from "./patient-form";
import { PatientDetails } from "./patient-details";
import { deletePatient, togglePatientBan } from "@/actions/patient-actions";
import { toast } from "sonner";

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

interface PatientsTableProps {
  patients: Patient[];
  onRefresh: () => void;
}

export function PatientsTable({ patients, onRefresh }: PatientsTableProps) {
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [banningPatient, setBanningPatient] = useState<{
    patient: Patient;
    ban: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingPatient) return;

    setIsLoading(true);
    try {
      const result = await deletePatient(deletingPatient.id);
      if (result.success) {
        toast.success("Patient deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete patient");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setDeletingPatient(null);
    }
  };

  const handleToggleBan = async () => {
    if (!banningPatient) return;

    setIsLoading(true);
    try {
      const result = await togglePatientBan(
        banningPatient.patient.id,
        banningPatient.ban,
        banningPatient.ban ? "Account suspended by admin" : undefined
      );
      if (result.success) {
        toast.success(
          `Patient ${banningPatient.ban ? "banned" : "unbanned"} successfully`
        );
        onRefresh();
      } else {
        toast.error(
          result.error ||
            `Failed to ${banningPatient.ban ? "ban" : "unban"} patient`
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setBanningPatient(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const getHealthScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
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
    return age.toString();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone || "N/A"}</TableCell>
                  <TableCell>
                    {calculateAge(patient.dateOfBirth || undefined)}
                  </TableCell>
                  <TableCell>{patient.bloodType || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      className={getHealthScoreColor(patient.healthScore || 0)}
                    >
                      {patient.healthScore || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.banned ? "destructive" : "default"}>
                      {patient.banned ? "Banned" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(patient.createdAt)}</TableCell>
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
                          onClick={() => setViewingPatient(patient)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingPatient(patient)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setBanningPatient({ patient, ban: !patient.banned })
                          }
                        >
                          {patient.banned ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unban Patient
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Ban Patient
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingPatient(patient)}
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

      <PatientForm
        open={!!editingPatient}
        onOpenChange={(open) => !open && setEditingPatient(null)}
        patient={
          editingPatient
            ? {
                id: editingPatient.id,
                name: editingPatient.name,
                email: editingPatient.email,
                dateOfBirth: editingPatient.dateOfBirth || undefined,
                gender: editingPatient.gender || undefined,
                phone: editingPatient.phone || undefined,
                address: editingPatient.address || undefined,
                emergencyContact: editingPatient.emergencyContact || undefined,
                emergencyPhone: editingPatient.emergencyPhone || undefined,
                bloodType: editingPatient.bloodType || undefined,
                allergies: editingPatient.allergies || undefined,
                medicalHistory: editingPatient.medicalHistory || undefined,
                insuranceProvider:
                  editingPatient.insuranceProvider || undefined,
                insuranceNumber: editingPatient.insuranceNumber || undefined,
              }
            : undefined
        }
        onSuccess={onRefresh}
      />

      <PatientDetails
        open={!!viewingPatient}
        onOpenChange={(open) => !open && setViewingPatient(null)}
        patient={viewingPatient}
      />

      <AlertDialog
        open={!!deletingPatient}
        onOpenChange={(open) => !open && setDeletingPatient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingPatient?.name}? This
              action cannot be undone and will permanently delete all patient
              data including medical records.
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
        open={!!banningPatient}
        onOpenChange={(open) => !open && setBanningPatient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banningPatient?.ban ? "Ban Patient" : "Unban Patient"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {banningPatient?.ban ? "ban" : "unban"}{" "}
              {banningPatient?.patient.name}?
              {banningPatient?.ban &&
                " This will prevent them from accessing their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBan}
              disabled={isLoading}
              className={
                banningPatient?.ban ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {isLoading
                ? `${banningPatient?.ban ? "Banning" : "Unbanning"}...`
                : banningPatient?.ban
                ? "Ban Patient"
                : "Unban Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
