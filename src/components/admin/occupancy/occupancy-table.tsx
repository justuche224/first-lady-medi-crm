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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  UserMinus,
  ArrowRightLeft,
  Calendar,
} from "lucide-react";
import { dischargePatient, transferPatient } from "@/actions/bed-actions";
import { toast } from "sonner";

interface OccupancyRecord {
  id: number;
  bedId: number;
  roomNumber: string;
  bedNumber: string;
  patientId: number;
  patientName: string;
  doctorId?: number;
  doctorName?: string;
  admissionDate: Date;
  actualDischargeDate?: Date;
  admissionReason: string;
  diagnosis?: string;
  status: string;
  total?: number;
}

interface OccupancyTableProps {
  records: OccupancyRecord[];
  onRefresh: () => void;
}

export function OccupancyTable({ records, onRefresh }: OccupancyTableProps) {
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OccupancyRecord | null>(
    null
  );
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDischarge = async () => {
    if (!selectedRecord) return;

    setIsLoading(true);
    try {
      const result = await dischargePatient(
        selectedRecord.id,
        dischargeNotes || undefined
      );
      if (result.success) {
        toast.success("Patient discharged successfully");
        onRefresh();
        setDischargeDialogOpen(false);
        setSelectedRecord(null);
        setDischargeNotes("");
      } else {
        toast.error(result.error || "Failed to discharge patient");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (newBedId: number) => {
    if (!selectedRecord) return;

    setIsLoading(true);
    try {
      const result = await transferPatient(selectedRecord.id, newBedId);
      if (result.success) {
        toast.success("Patient transferred successfully");
        onRefresh();
        setTransferDialogOpen(false);
        setSelectedRecord(null);
      } else {
        toast.error(result.error || "Failed to transfer patient");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      discharged: "secondary",
      transferred: "outline",
    } as const;

    const colors = {
      active: "bg-green-100 text-green-800",
      discharged: "bg-gray-100 text-gray-800",
      transferred: "bg-blue-100 text-blue-800",
    } as const;

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={colors[status as keyof typeof colors]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No occupancy records found. Allocate patients to beds to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Bed</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{record.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {record.patientId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {record.roomNumber}-{record.bedNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bed ID: {record.bedId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{record.doctorName || "Not assigned"}</TableCell>
                <TableCell>{formatDate(record.admissionDate)}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {record.diagnosis || record.admissionReason}
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
                      {record.status === "active" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRecord(record);
                              setDischargeDialogOpen(true);
                            }}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Discharge Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRecord(record);
                              setTransferDialogOpen(true);
                            }}
                          >
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Transfer Bed
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Discharge Dialog */}
      <AlertDialog
        open={dischargeDialogOpen}
        onOpenChange={setDischargeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discharge Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discharge{" "}
              <strong>{selectedRecord?.patientName}</strong> from bed{" "}
              <strong>
                {selectedRecord?.roomNumber}-{selectedRecord?.bedNumber}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Discharge Notes (Optional)
              </label>
              <textarea
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
                placeholder="Add any notes about the discharge..."
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDischarge}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Discharging..." : "Discharge Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Dialog */}
      <AlertDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Transfer <strong>{selectedRecord?.patientName}</strong> to a
              different bed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select New Bed</label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose an available bed for the transfer.
              </p>
              {/* This would be a more complex component for selecting beds */}
              <div className="text-sm text-muted-foreground">
                Available beds selection would go here...
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Transferring..." : "Transfer Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
