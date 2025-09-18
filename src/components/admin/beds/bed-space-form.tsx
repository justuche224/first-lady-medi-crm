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
import { X, Plus } from "lucide-react";
import { bedStatuses, bedTypes } from "@/db/schema";
import {
  createBedSpace,
  updateBedSpace,
  getDepartments,
} from "@/actions/bed-actions";
import { toast } from "sonner";

interface BedSpaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bedToEdit?: {
    id: number;
    roomNumber: string;
    bedNumber: string;
    departmentId?: number | null;
    ward?: string | null;
    floor?: number | null;
    type: (typeof bedTypes)[number];
    status: (typeof bedStatuses)[number];
    description?: string | null;
    equipment?: string[] | null;
  } | null;
}

export function BedSpaceForm({
  open,
  onOpenChange,
  onSuccess,
  bedToEdit,
}: BedSpaceFormProps) {
  const [formData, setFormData] = useState({
    roomNumber: "",
    bedNumber: "",
    departmentId: "",
    ward: "",
    floor: "",
    type: "general" as (typeof bedTypes)[number],
    status: "available" as (typeof bedStatuses)[number],
    description: "",
    equipment: [] as string[],
  });
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [newEquipment, setNewEquipment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode] = useState(!!bedToEdit);

  useEffect(() => {
    if (open) {
      loadDepartments();
      if (bedToEdit) {
        setFormData({
          roomNumber: bedToEdit.roomNumber,
          bedNumber: bedToEdit.bedNumber,
          departmentId: bedToEdit.departmentId?.toString() || "",
          ward: bedToEdit.ward || "",
          floor: bedToEdit.floor?.toString() || "",
          type: bedToEdit.type,
          status: bedToEdit.status,
          description: bedToEdit.description || "",
          equipment: bedToEdit.equipment || [],
        });
      } else {
        setFormData({
          roomNumber: "",
          bedNumber: "",
          departmentId: "",
          ward: "",
          floor: "",
          type: "general",
          status: "available",
          description: "",
          equipment: [],
        });
      }
    }
  }, [open, bedToEdit]);

  const loadDepartments = async () => {
    try {
      const result = await getDepartments();
      if (result.success) {
        setDepartments(result.departments || []);
      }
    } catch {
      // Silently fail
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        departmentId: formData.departmentId
          ? parseInt(formData.departmentId)
          : undefined,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        equipment:
          formData.equipment.length > 0 ? formData.equipment : undefined,
      };

      if (isEditMode && bedToEdit) {
        const result = await updateBedSpace(bedToEdit.id, submitData);
        if (result.success) {
          toast.success("Bed space updated successfully");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update bed space");
        }
      } else {
        const result = await createBedSpace(submitData);
        if (result.success) {
          toast.success("Bed space created successfully");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create bed space");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const addEquipment = () => {
    if (
      newEquipment.trim() &&
      !formData.equipment.includes(newEquipment.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()],
      }));
      setNewEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e !== equipment),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Bed Space" : "Create New Bed Space"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the bed space information below."
              : "Fill in the details to create a new bed space."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number *</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    roomNumber: e.target.value,
                  }))
                }
                placeholder="e.g., 101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedNumber">Bed Number *</Label>
              <Input
                id="bedNumber"
                value={formData.bedNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bedNumber: e.target.value,
                  }))
                }
                placeholder="e.g., A"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward">Ward</Label>
              <Input
                id="ward"
                value={formData.ward}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ward: e.target.value }))
                }
                placeholder="e.g., Medical Ward"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, floor: e.target.value }))
                }
                placeholder="e.g., 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as (typeof bedTypes)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bedTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as (typeof bedStatuses)[number],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bedStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Additional notes about the bed space..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Equipment</Label>
            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addEquipment)}
                placeholder="Add equipment..."
                className="flex-1"
              />
              <Button type="button" onClick={addEquipment} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.equipment.map((equipment, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {equipment}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeEquipment(equipment)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
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
              {isLoading
                ? "Saving..."
                : isEditMode
                ? "Update Bed Space"
                : "Create Bed Space"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
