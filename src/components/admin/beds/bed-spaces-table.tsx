"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { bedStatuses, bedTypes } from "@/db/schema";
import { deleteBedSpace } from "@/actions/bed-actions";
import { toast } from "sonner";

interface BedSpace {
  id: number;
  roomNumber: string;
  bedNumber: string;
  departmentId?: number | null;
  departmentName?: string | null;
  ward?: string | null;
  floor?: number | null;
  type: (typeof bedTypes)[number];
  status: (typeof bedStatuses)[number];
  description?: string | null;
  equipment?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  total?: number;
}

interface BedSpacesTableProps {
  bedSpaces: BedSpace[];
  onRefresh: () => void;
}

export function BedSpacesTable({ bedSpaces, onRefresh }: BedSpacesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bedToDelete, setBedToDelete] = useState<BedSpace | null>(null);

  const handleDelete = async () => {
    if (!bedToDelete) return;

    try {
      const result = await deleteBedSpace(bedToDelete.id);
      if (result.success) {
        toast.success("Bed space deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete bed space");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setBedToDelete(null);
    }
  };

  const getStatusBadge = (status: (typeof bedStatuses)[number]) => {
    const variants = {
      available: "default",
      occupied: "secondary",
      maintenance: "destructive",
      reserved: "outline",
    } as const;

    const colors = {
      available: "bg-green-100 text-green-800",
      occupied: "bg-blue-100 text-blue-800",
      maintenance: "bg-red-100 text-red-800",
      reserved: "bg-yellow-100 text-yellow-800",
    } as const;

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: (typeof bedTypes)[number]) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      icu: "bg-red-100 text-red-800",
      ccu: "bg-orange-100 text-orange-800",
      emergency: "bg-yellow-100 text-yellow-800",
      maternity: "bg-pink-100 text-pink-800",
      pediatric: "bg-blue-100 text-blue-800",
      surgical: "bg-purple-100 text-purple-800",
    } as const;

    return (
      <Badge variant="outline" className={colors[type]}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  if (bedSpaces.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bed spaces found. Create your first bed space to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room/Bed</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bedSpaces.map((bed) => (
              <TableRow key={bed.id}>
                <TableCell className="font-medium">
                  {bed.roomNumber}-{bed.bedNumber}
                </TableCell>
                <TableCell>{bed.departmentName || "Not assigned"}</TableCell>
                <TableCell>{bed.ward || "Not assigned"}</TableCell>
                <TableCell>{bed.floor || "N/A"}</TableCell>
                <TableCell>{getTypeBadge(bed.type)}</TableCell>
                <TableCell>{getStatusBadge(bed.status)}</TableCell>
                <TableCell>
                  {new Date(bed.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Bed
                      </DropdownMenuItem>
                      {bed.status === "available" && (
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Allocate Patient
                        </DropdownMenuItem>
                      )}
                      {bed.status === "occupied" && (
                        <DropdownMenuItem>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Discharge Patient
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setBedToDelete(bed);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Bed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bed space{" "}
              <strong>
                {bedToDelete?.roomNumber}-{bedToDelete?.bedNumber}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Bed Space
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
