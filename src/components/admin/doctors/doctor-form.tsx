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
  createDoctor,
  updateDoctor,
  type CreateDoctorData,
} from "@/actions/doctor-actions";
import { getDepartments } from "@/actions/department-actions";
import { toast } from "sonner";

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  licenseNumber: z.string().min(3, "License number is required"),
  specialty: z.string().min(2, "Specialty is required"),
  departmentId: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  education: z.string().optional(),
  certifications: z.string().optional(),
  consultationFee: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: {
    id: number;
    userId: string;
    name: string;
    email: string;
    licenseNumber: string;
    specialty: string;
    departmentId?: number | null;
    yearsOfExperience?: number | null;
    education?: string | null;
    certifications?: string | null;
    consultationFee?: string | null;
  };
  onSuccess?: () => void;
}

interface Department {
  id: number;
  name: string;
  description?: string | null;
}

export function DoctorForm({
  open,
  onOpenChange,
  doctor,
  onSuccess,
}: DoctorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const isEdit = !!doctor;

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: doctor?.name || "",
      email: doctor?.email || "",
      password: "",
      licenseNumber: doctor?.licenseNumber || "",
      specialty: doctor?.specialty || "",
      departmentId: doctor?.departmentId?.toString() || "none",
      yearsOfExperience: doctor?.yearsOfExperience?.toString() || "",
      education: doctor?.education || "",
      certifications: doctor?.certifications || "",
      consultationFee: doctor?.consultationFee || "",
    },
  });

  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      const result = await getDepartments();
      if (result.success && result.departments) {
        setDepartments(result.departments);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const onSubmit = async (data: DoctorFormData) => {
    setIsLoading(true);
    try {
      let result;

      const formData = {
        ...data,
        departmentId:
          data.departmentId === "none"
            ? undefined
            : parseInt(data.departmentId || "0"),
        yearsOfExperience: data.yearsOfExperience
          ? parseInt(data.yearsOfExperience)
          : undefined,
        consultationFee: data.consultationFee
          ? parseFloat(data.consultationFee)
          : undefined,
      };

      if (isEdit) {
        const { password: _, ...updateData } = formData;
        result = await updateDoctor(doctor.id, updateData);
      } else {
        if (!formData.password) {
          throw new Error("Password is required for new doctors");
        }
        result = await createDoctor(formData as CreateDoctorData);
      }

      if (result.success) {
        toast.success(
          isEdit ? "Doctor updated successfully" : "Doctor created successfully"
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update doctor information and credentials"
              : "Create a new doctor account with medical credentials"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doctor@hospital.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Secure password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="MD123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Cardiology, Pediatrics"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Department</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5"
                        min="0"
                        max="50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consultationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150.00"
                        min="0"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Medical degree, university, graduation year..."
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
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Board certifications, specializations..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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
                  ? "Update Doctor"
                  : "Create Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
