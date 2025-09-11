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
import { prescribeMedication } from "@/actions/medication-actions";
import { toast } from "sonner";

const prescriptionSchema = z.object({
  patientId: z.number().min(1, "Please select a patient"),
  appointmentId: z.number().optional(),
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  refills: z.number().min(0).optional(),
  sideEffects: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
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

export function PrescriptionForm({
  open,
  onOpenChange,
  patients,
  appointments,
  onSuccess,
}: PrescriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: 0,
      appointmentId: undefined,
      name: "",
      genericName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      startDate: new Date(),
      endDate: undefined,
      refills: 0,
      sideEffects: "",
    },
  });

  const patientAppointments =
    appointments?.filter((apt) => apt.patientId === selectedPatientId) || [];

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsLoading(true);
    try {
      const result = await prescribeMedication({
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        name: data.name,
        genericName: data.genericName || undefined,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration || undefined,
        instructions: data.instructions || undefined,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        refills: data.refills,
        sideEffects: data.sideEffects || undefined,
      });

      if (result.success) {
        toast.success("Prescription created successfully");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create prescription");
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prescribe New Medication</DialogTitle>
          <DialogDescription>
            Create a new medication prescription for a patient.
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

            {/* Medication Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lisinopril" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genericName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lisinopril" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">
                          Three times daily
                        </SelectItem>
                        <SelectItem value="Four times daily">
                          Four times daily
                        </SelectItem>
                        <SelectItem value="Every 4 hours">
                          Every 4 hours
                        </SelectItem>
                        <SelectItem value="Every 6 hours">
                          Every 6 hours
                        </SelectItem>
                        <SelectItem value="Every 8 hours">
                          Every 8 hours
                        </SelectItem>
                        <SelectItem value="Every 12 hours">
                          Every 12 hours
                        </SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                        <SelectItem value="Once weekly">Once weekly</SelectItem>
                        <SelectItem value="Twice weekly">
                          Twice weekly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 30 days, Long-term"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Refills</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
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

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
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
                            date < form.getValues("startDate") ||
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
            </div>

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Take with or without food, preferably at the same time each day"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide specific instructions for taking this medication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Side Effects */}
            <FormField
              control={form.control}
              name="sideEffects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Side Effects</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Nausea, dizziness, headache"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List common side effects patients should be aware of.
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
                Create Prescription
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
