"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Building } from "lucide-react";
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
import { DepartmentForm } from "./department-form";
import { DepartmentDetails } from "./department-details";
import { deleteDepartment } from "@/actions/department-actions";
import { toast } from "sonner";

interface Department {
  id: number;
  name: string;
  description?: string | null;
  headDoctorId?: string | null;
  headDoctorName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentsTableProps {
  departments: Department[];
  onRefresh: () => void;
}

export function DepartmentsTable({
  departments,
  onRefresh,
}: DepartmentsTableProps) {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(
    null
  );
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingDepartment) return;

    setIsLoading(true);
    try {
      const result = await deleteDepartment(deletingDepartment.id);
      if (result.success) {
        toast.success("Department deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete department");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setDeletingDepartment(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Head Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {department.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {department.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.headDoctorName ? (
                      <Badge variant="outline">
                        {department.headDoctorName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No head doctor
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        department.headDoctorId ? "default" : "secondary"
                      }
                    >
                      {department.headDoctorId ? "Complete" : "Needs Head"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(department.createdAt)}</TableCell>
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
                          onClick={() => setViewingDepartment(department)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingDepartment(department)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingDepartment(department)}
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

      <DepartmentForm
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        department={editingDepartment || undefined}
        onSuccess={onRefresh}
      />

      <DepartmentDetails
        open={!!viewingDepartment}
        onOpenChange={(open) => !open && setViewingDepartment(null)}
        department={viewingDepartment}
      />

      <AlertDialog
        open={!!deletingDepartment}
        onOpenChange={(open) => !open && setDeletingDepartment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingDepartment?.name}&quot;? This
              action cannot be undone. Make sure there are no doctors assigned
              to this department first.
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
    </>
  );
}
