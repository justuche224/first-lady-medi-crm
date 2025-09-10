"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDepartment,
  updateDepartment,
  getAvailableDoctors,
  type CreateDepartmentData,
} from "@/actions/department-actions";
import { toast } from "sonner";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  headDoctorId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: {
    id: number;
    name: string;
    description?: string | null;
    headDoctorId?: string | null;
  };
  onSuccess?: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty?: string | null;
}

export function DepartmentForm({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const isEdit = !!department;

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
      headDoctorId: department?.headDoctorId || "none",
    },
  });

  useEffect(() => {
    if (open) {
      loadDoctors();
    }
  }, [open]);

  const loadDoctors = async () => {
    try {
      const result = await getAvailableDoctors();
      if (result.success && result.doctors) {
        setDoctors(result.doctors);
      }
    } catch (error) {
      console.error("Failed to load doctors:", error);
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    setIsLoading(true);
    try {
      let result;

      const formData = {
        ...data,
        headDoctorId:
          data.headDoctorId === "none" ? undefined : data.headDoctorId,
      };

      if (isEdit) {
        result = await updateDepartment(department.id, formData);
      } else {
        if (!formData.name) {
          throw new Error("Department name is required");
        }
        result = await createDepartment(formData as CreateDepartmentData);
      }

      if (result.success) {
        toast.success(
          isEdit
            ? "Department updated successfully"
            : "Department created successfully"
        );
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Department" : "Add New Department"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update department information"
              : "Create a new hospital department"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Cardiology, Emergency, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the department..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headDoctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head Doctor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select head doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Head Doctor</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}{" "}
                          {doctor.specialty && `(${doctor.specialty})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEdit
                  ? "Update Department"
                  : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
