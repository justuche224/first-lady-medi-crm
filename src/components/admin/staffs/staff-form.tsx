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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createStaff,
  updateStaff,
  getDepartments,
  getSupervisors,
  type CreateStaffData,
} from "@/actions/staff-actions";
import { toast } from "sonner";

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  employeeId: z.string().min(3, "Employee ID must be at least 3 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  hireDate: z.string().min(1, "Hire date is required"),
  departmentId: z.string().optional(),
  salary: z.string().optional(),
  supervisorId: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: {
    id: number;
    name: string;
    email: string;
    employeeId: string;
    position: string;
    hireDate: string;
    departmentId?: number;
    salary?: string;
    supervisorId?: string;
  };
  onSuccess?: () => void;
}

interface Department {
  id: number;
  name: string;
  description?: string | null;
}

interface Supervisor {
  id: string;
  name: string;
  position?: string | null;
}

export function StaffForm({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const isEdit = !!staff;

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: staff?.name || "",
      email: staff?.email || "",
      password: "",
      employeeId: staff?.employeeId || "",
      position: staff?.position || "",
      hireDate: staff?.hireDate || "",
      departmentId: staff?.departmentId?.toString() || "none",
      salary: staff?.salary || "",
      supervisorId: staff?.supervisorId || "none",
    },
  });

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadSupervisors();
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

  const loadSupervisors = async () => {
    try {
      const result = await getSupervisors();
      if (result.success && result.supervisors) {
        setSupervisors(result.supervisors);
      }
    } catch (error) {
      console.error("Failed to load supervisors:", error);
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    setIsLoading(true);
    try {
      let result;

      const formData = {
        ...data,
        departmentId:
          data.departmentId && data.departmentId !== "none"
            ? parseInt(data.departmentId)
            : undefined,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        supervisorId:
          data.supervisorId === "none" ? undefined : data.supervisorId,
      };

      if (isEdit) {
        const { password, ...updateData } = formData;
        void password;
        result = await updateStaff(staff.id, updateData);
      } else {
        if (!formData.password) {
          throw new Error("Password is required for new staff");
        }
        result = await createStaff(formData as CreateStaffData);
      }

      if (result.success) {
        toast.success(
          isEdit ? "Staff updated successfully" : "Staff created successfully"
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update staff member information"
              : "Create a new staff account"}
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
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
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
                          placeholder="••••••••"
                          type="password"
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
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nurse, Administrator, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="50000"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supervisorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Supervisor</SelectItem>
                        {supervisors.map((supervisor) => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.name}{" "}
                            {supervisor.position && `(${supervisor.position})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  ? "Update Staff"
                  : "Create Staff"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
