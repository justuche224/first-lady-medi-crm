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
import { StaffForm } from "./staff-form";
import { StaffDetails } from "./staff-details";
import { deleteStaff, toggleStaffBan } from "@/actions/staff-actions";
import { toast } from "sonner";

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

interface StaffsTableProps {
  staffs: Staff[];
  onRefresh: () => void;
}

export function StaffsTable({ staffs, onRefresh }: StaffsTableProps) {
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [banningStaff, setBanningStaff] = useState<{
    staff: Staff;
    ban: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingStaff) return;

    setIsLoading(true);
    try {
      const result = await deleteStaff(deletingStaff.id);
      if (result.success) {
        toast.success("Staff member deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete staff member");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setDeletingStaff(null);
    }
  };

  const handleToggleBan = async () => {
    if (!banningStaff) return;

    setIsLoading(true);
    try {
      const result = await toggleStaffBan(
        banningStaff.staff.id,
        banningStaff.ban,
        banningStaff.ban ? "Account suspended by admin" : undefined
      );
      if (result.success) {
        toast.success(
          `Staff member ${
            banningStaff.ban ? "banned" : "unbanned"
          } successfully`
        );
        onRefresh();
      } else {
        toast.error(
          result.error ||
            `Failed to ${banningStaff.ban ? "ban" : "unban"} staff member`
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setBanningStaff(null);
    }
  };

  //   const formatDate = (date: Date | string) => {
  //     return new Date(date).toLocaleDateString();
  //   };

  const formatSalary = (salary?: string) => {
    if (!salary) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months} months`;
    } else {
      return `${diffDays} days`;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Tenure</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-mono">
                    {staff.employeeId}
                  </TableCell>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>{staff.departmentName || "N/A"}</TableCell>
                  <TableCell>
                    {formatSalary(staff.salary || undefined)}
                  </TableCell>
                  <TableCell>{calculateTenure(staff.hireDate)}</TableCell>
                  <TableCell>
                    <Badge variant={staff.banned ? "destructive" : "default"}>
                      {staff.banned ? "Banned" : "Active"}
                    </Badge>
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
                          onClick={() => setViewingStaff(staff)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingStaff(staff)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setBanningStaff({ staff, ban: !staff.banned })
                          }
                        >
                          {staff.banned ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unban Staff
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Ban Staff
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingStaff(staff)}
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

      <StaffForm
        open={!!editingStaff}
        onOpenChange={(open) => !open && setEditingStaff(null)}
        staff={
          editingStaff
            ? {
                id: editingStaff.id,
                name: editingStaff.name,
                email: editingStaff.email,
                employeeId: editingStaff.employeeId,
                position: editingStaff.position,
                hireDate: editingStaff.hireDate,
                departmentId: editingStaff.departmentId || undefined,
                salary: editingStaff.salary || undefined,
                supervisorId: editingStaff.supervisorId || undefined,
              }
            : undefined
        }
        onSuccess={onRefresh}
      />

      <StaffDetails
        open={!!viewingStaff}
        onOpenChange={(open) => !open && setViewingStaff(null)}
        staff={viewingStaff}
      />

      <AlertDialog
        open={!!deletingStaff}
        onOpenChange={(open) => !open && setDeletingStaff(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingStaff?.name} (
              {deletingStaff?.employeeId})? This action cannot be undone and
              will permanently delete all staff data.
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
        open={!!banningStaff}
        onOpenChange={(open) => !open && setBanningStaff(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banningStaff?.ban ? "Ban Staff Member" : "Unban Staff Member"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {banningStaff?.ban ? "ban" : "unban"}{" "}
              {banningStaff?.staff.name}?
              {banningStaff?.ban &&
                " This will prevent them from accessing their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBan}
              disabled={isLoading}
              className={banningStaff?.ban ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoading
                ? `${banningStaff?.ban ? "Banning" : "Unbanning"}...`
                : banningStaff?.ban
                ? "Ban Staff"
                : "Unban Staff"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
