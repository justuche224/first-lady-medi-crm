"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { orderLabTest } from "@/actions/lab-actions";
import { toast } from "sonner";

const labOrderSchema = z.object({
  patientId: z.number().min(1, "Please select a patient"),
  appointmentId: z.number().optional(),
  testName: z.string().min(1, "Test name is required"),
  testCategory: z.string().min(1, "Test category is required"),
  testDate: z.date(),
  instructions: z.string().optional(),
  clinicalInfo: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

type LabOrderFormData = z.infer<typeof labOrderSchema>;

interface LabOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Array<{
    id: number;
    name: string;
    age?: number;
  }>;
  appointments?: Array<{
    id: number;
    patientId: number;
    patientName: string;
    date: string;
    type: string;
  }>;
  onSuccess?: () => void;
}

export function LabOrderForm({
  open,
  onOpenChange,
  patients,
  appointments,
  onSuccess,
}: LabOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );

  const form = useForm<LabOrderFormData>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      patientId: 0,
      appointmentId: undefined,
      testName: "",
      testCategory: "",
      testDate: new Date(),
      instructions: "",
      clinicalInfo: "",
      priority: "normal",
    },
  });

  const patientAppointments =
    appointments?.filter((apt) => apt.patientId === selectedPatientId) || [];

  const onSubmit = async (data: LabOrderFormData) => {
    setIsLoading(true);
    try {
      const result = await orderLabTest({
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        testName: data.testName,
        testCategory: data.testCategory,
        testDate: data.testDate,
      });

      if (result.success) {
        toast.success("Lab test ordered successfully");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to order lab test");
      }
    } catch (error) {
      console.error("Error ordering lab test:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientChange = (patientId: string) => {
    const id = parseInt(patientId);
    setSelectedPatientId(id);
    form.setValue("patientId", id);
    form.setValue("appointmentId", undefined); // Reset appointment when patient changes
  };

  // Predefined lab test categories and common tests
  const testCategories = [
    "Blood Work",
    "Urine Analysis",
    "Imaging",
    "Microbiology",
    "Pathology",
    "Cardiac",
    "Endocrine",
    "Hepatic",
    "Renal",
    "Infectious Disease",
    "Tumor Markers",
    "Coagulation",
  ];

  const commonTests = {
    "Blood Work": [
      "Complete Blood Count (CBC)",
      "Comprehensive Metabolic Panel (CMP)",
      "Basic Metabolic Panel (BMP)",
      "Lipid Panel",
      "Thyroid Function Panel",
      "Hemoglobin A1c",
      "Vitamin D",
      "Iron Panel",
      "Liver Function Tests",
    ],
    "Urine Analysis": [
      "Urinalysis",
      "Urine Culture",
      "24-Hour Urine Protein",
      "Urine Drug Screen",
    ],
    Cardiac: ["Cardiac Enzymes", "Troponin", "CK-MB", "BNP", "Lipid Profile"],
    Imaging: [
      "Chest X-Ray",
      "Abdominal Ultrasound",
      "CT Scan",
      "MRI",
      "Mammogram",
    ],
    Microbiology: [
      "Blood Culture",
      "Urine Culture",
      "Stool Culture",
      "Throat Culture",
      "Wound Culture",
    ],
    Endocrine: ["Thyroid Panel", "Cortisol", "ACTH", "Growth Hormone", "PTH"],
  };

  const selectedCategory = form.watch("testCategory");
  const availableTests = selectedCategory
    ? commonTests[selectedCategory as keyof typeof commonTests] || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order New Lab Test</DialogTitle>
          <DialogDescription>
            Create a new laboratory test order for a patient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select
                    onValueChange={handlePatientChange}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
                          {patient.name}
                          {patient.age && ` (${patient.age} years)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Appointment Selection (if available) */}
            {selectedPatientId && patientAppointments.length > 0 && (
              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Appointment (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        form.setValue(
                          "appointmentId",
                          value ? parseInt(value) : undefined
                        )
                      }
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No appointment</SelectItem>
                        {patientAppointments.map((appointment) => (
                          <SelectItem
                            key={appointment.id}
                            value={appointment.id.toString()}
                          >
                            {format(new Date(appointment.date), "PPP")} -{" "}
                            {appointment.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Test Category */}
            <FormField
              control={form.control}
              name="testCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {testCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Name */}
            <FormField
              control={form.control}
              name="testName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Complete Blood Count"
                      {...field}
                    />
                  </FormControl>
                  {availableTests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Common tests in this category:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableTests.slice(0, 5).map((test) => (
                          <Button
                            key={test}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue("testName", test)}
                          >
                            {test}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the priority level for this lab test.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Date */}
            <FormField
              control={form.control}
              name="testDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Test Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinical Information */}
            <FormField
              control={form.control}
              name="clinicalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinical Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Relevant clinical information, symptoms, or reason for test..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide clinical context for this lab test.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Special Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fasting requirements, special handling, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any special instructions for the lab or patient preparation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Order Lab Test
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
