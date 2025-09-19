"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createAppointment, getAvailableSlots } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Patient {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

interface Doctor {
  id: number;
  userId: string;
  name: string;
  email: string;
  licenseNumber: string;
  specialty: string;
  departmentId?: number | null;
  departmentName?: string | null;
  yearsOfExperience?: number | null;
  consultationFee?: string | null;
  rating?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminBookAppointmentFormProps {
  patients: Patient[];
  doctors: Doctor[];
  user: User;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function AdminBookAppointmentForm({
  patients,
  doctors,
}: AdminBookAppointmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | undefined>(
    undefined
  );
  const [selectedDoctor, setSelectedDoctor] = useState<number | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [formData, setFormData] = useState({
    type: "consultation",
    reason: "",
    symptoms: "",
    notes: "",
  });

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;

    setLoadingSlots(true);
    setSelectedTime("");
    setAvailableSlots([]);

    try {
      const result = await getAvailableSlots(selectedDoctor, selectedDate);
      if (result.success) {
        setAvailableSlots(result.slots || []);
      } else {
        toast.error("Failed to load available time slots");
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Failed to load available time slots");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  // Load available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate, loadAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please select a patient, doctor, date, and time");
      return;
    }

    setIsLoading(true);

    try {
      const appointmentData = {
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        duration: 30,
        type: formData.type,
        reason: formData.reason || undefined,
        symptoms: formData.symptoms || undefined,
        notes: formData.notes || undefined,
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast.success("Appointment booked successfully!");
        router.push("/admin/appointments");
      } else {
        toast.error(result.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPatientInfo = patients.find(
    (patient) => patient.id === selectedPatient
  );
  const selectedDoctorInfo = doctors.find((doc) => doc.id === selectedDoctor);

  // Filter out past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <div className="space-y-2">
        <Label htmlFor="patient">Select Patient *</Label>
        <Select
          value={selectedPatient?.toString() || ""}
          onValueChange={(value) => setSelectedPatient(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <span className="font-medium">{patient.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {patient.email}
                    </span>
                    {patient.phone && (
                      <span className="text-sm text-gray-500 ml-2">
                        • {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Patient Info */}
        {selectedPatientInfo && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">
                  {selectedPatientInfo.name}
                </h4>
                <p className="text-sm text-green-700">
                  {selectedPatientInfo.email}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                  {selectedPatientInfo.phone && (
                    <span>📞 {selectedPatientInfo.phone}</span>
                  )}
                  {selectedPatientInfo.dateOfBirth && (
                    <span>
                      🎂{" "}
                      {new Date(
                        selectedPatientInfo.dateOfBirth
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Doctor Selection */}
      <div className="space-y-2">
        <Label htmlFor="doctor">Select Healthcare Provider *</Label>
        <Select
          value={selectedDoctor?.toString() || ""}
          onValueChange={(value) => setSelectedDoctor(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a doctor or specialist" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {item.specialty}
                    </span>
                    {item.consultationFee && (
                      <span className="text-sm text-green-600 ml-2">
                        (${item.consultationFee})
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Doctor Info */}
        {selectedDoctorInfo && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">
                  {selectedDoctorInfo.name}
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedDoctorInfo.specialty}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                  <span>
                    {selectedDoctorInfo.yearsOfExperience || 0} years experience
                  </span>
                  {selectedDoctorInfo.departmentName && (
                    <span>{selectedDoctorInfo.departmentName}</span>
                  )}
                  {selectedDoctorInfo.consultationFee && (
                    <Badge variant="outline" className="text-green-600">
                      ${selectedDoctorInfo.consultationFee}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <Label>Select Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="space-y-2">
        <Label>Select Time *</Label>
        {selectedDoctor && selectedDate ? (
          <div>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading available times...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    type="button"
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(slot.time)}
                    className="justify-center"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No available time slots for this date</p>
                <p className="text-sm">Please select a different date</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>Please select a doctor and date first</p>
          </div>
        )}
      </div>

      {/* Appointment Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Appointment Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultation">General Consultation</SelectItem>
            <SelectItem value="follow_up">Follow-up Visit</SelectItem>
            <SelectItem value="checkup">Regular Check-up</SelectItem>
            <SelectItem value="urgent">Urgent Care</SelectItem>
            <SelectItem value="specialist">Specialist Consultation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reason for Visit */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Visit</Label>
        <Input
          id="reason"
          placeholder="Brief description of the appointment purpose"
          value={formData.reason}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reason: e.target.value }))
          }
        />
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <Label htmlFor="symptoms">Patient Symptoms (if any)</Label>
        <Textarea
          id="symptoms"
          placeholder="Describe any symptoms the patient is experiencing..."
          value={formData.symptoms}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, symptoms: e.target.value }))
          }
          rows={3}
        />
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information, medical history, or special instructions..."
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex space-x-4 pt-4">
        <Button
          type="submit"
          disabled={
            isLoading ||
            !selectedPatient ||
            !selectedDoctor ||
            !selectedDate ||
            !selectedTime
          }
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking Appointment...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Book Appointment
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
