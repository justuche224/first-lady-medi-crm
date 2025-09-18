"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Bed } from "lucide-react";
import { allocateBed } from "@/actions/bed-actions";
import { priorityLevels } from "@/db/schema";
import { toast } from "sonner";

interface AvailableBed {
  id: number;
  roomNumber: string;
  bedNumber: string;
  departmentId?: number;
  departmentName?: string;
  ward?: string;
  floor?: number;
  type: string;
  description?: string;
  equipment?: string[] | string;
}

interface PatientAllocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableBeds: AvailableBed[];
}

export function PatientAllocationForm({
  open,
  onOpenChange,
  onSuccess,
  availableBeds,
}: PatientAllocationFormProps) {
  const [formData, setFormData] = useState({
    patientId: "",
    bedId: "",
    doctorId: "",
    admissionReason: "",
    diagnosis: "",
    expectedDischargeDate: "",
    priority: "normal" as (typeof priorityLevels)[number],
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBed, setSelectedBed] = useState<AvailableBed | null>(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        patientId: "",
        bedId: "",
        doctorId: "",
        admissionReason: "",
        diagnosis: "",
        expectedDischargeDate: "",
        priority: "normal",
        notes: "",
      });
      setSelectedBed(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await allocateBed({
        bedId: parseInt(formData.bedId),
        patientId: parseInt(formData.patientId),
        doctorId: formData.doctorId ? parseInt(formData.doctorId) : undefined,
        admissionReason: formData.admissionReason,
        diagnosis: formData.diagnosis || undefined,
        expectedDischargeDate: formData.expectedDischargeDate || undefined,
        priority: formData.priority,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success("Patient allocated to bed successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to allocate bed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBedSelect = (bedId: string) => {
    const bed = availableBeds.find((b) => b.id.toString() === bedId);
    if (bed) {
      // Parse equipment field if it's a JSON string
      let equipment = bed.equipment;
      if (typeof bed.equipment === "string") {
        try {
          equipment = JSON.parse(bed.equipment);
        } catch (error) {
          console.error("Failed to parse equipment JSON:", error);
          equipment = [];
        }
      }

      const parsedBed = {
        ...bed,
        equipment: equipment,
      };
      setSelectedBed(parsedBed);
    } else {
      setSelectedBed(null);
    }
    setFormData((prev) => ({ ...prev, bedId }));
  };

  const getBedTypeBadge = (type: string) => {
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
      <Badge
        variant="outline"
        className={colors[type as keyof typeof colors] || colors.general}
      >
        {type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Patient Bed Allocation</DialogTitle>
          <DialogDescription>
            Allocate an available bed to a patient for admission.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID *</Label>
                <Input
                  id="patientId"
                  type="number"
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      patientId: e.target.value,
                    }))
                  }
                  placeholder="Enter patient ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Attending Doctor ID</Label>
                <Input
                  id="doctorId"
                  type="number"
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      doctorId: e.target.value,
                    }))
                  }
                  placeholder="Enter doctor ID (optional)"
                />
              </div>
            </div>
          </div>

          {/* Bed Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Bed Selection
            </h3>
            <div className="space-y-2">
              <Label htmlFor="bedId">Available Bed *</Label>
              <Select value={formData.bedId} onValueChange={handleBedSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an available bed" />
                </SelectTrigger>
                <SelectContent>
                  {availableBeds.map((bed) => (
                    <SelectItem key={bed.id} value={bed.id.toString()}>
                      {bed.roomNumber}-{bed.bedNumber} (
                      {bed.departmentName || "No Dept"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBed && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Selected Bed Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {selectedBed.roomNumber}-{selectedBed.bedNumber}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {getBedTypeBadge(selectedBed.type)}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span>{" "}
                    {selectedBed.departmentName || "Not assigned"}
                  </div>
                  <div>
                    <span className="font-medium">Ward:</span>{" "}
                    {selectedBed.ward || "Not assigned"}
                  </div>
                  {selectedBed.floor && (
                    <div>
                      <span className="font-medium">Floor:</span>{" "}
                      {selectedBed.floor}
                    </div>
                  )}
                </div>
                {selectedBed.equipment &&
                  Array.isArray(selectedBed.equipment) &&
                  selectedBed.equipment.length > 0 && (
                    <div>
                      <span className="font-medium">Equipment:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedBed.equipment.map((item, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                {selectedBed.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedBed.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admission Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Admission Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionReason">Admission Reason *</Label>
                <Textarea
                  id="admissionReason"
                  value={formData.admissionReason}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      admissionReason: e.target.value,
                    }))
                  }
                  placeholder="Reason for admission..."
                  rows={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      diagnosis: e.target.value,
                    }))
                  }
                  placeholder="Initial diagnosis..."
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDischargeDate">
                  Expected Discharge Date
                </Label>
                <Input
                  id="expectedDischargeDate"
                  type="date"
                  value={formData.expectedDischargeDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expectedDischargeDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: value as (typeof priorityLevels)[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Allocating..." : "Allocate Bed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
