import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getPatients, getAvailableDoctorsForBooking } from "@/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  ArrowLeft,
  CalendarDays,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AdminBookAppointmentForm } from "./admin-book-appointment-form";

interface Patient {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

interface PatientApiResponse {
  id: number;
  userId: string;
  name: string;
  email: string;
  banned: boolean | null;
  createdAt: Date;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  healthScore: number | null;
  total: number;
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

const AdminBookAppointmentPage = async () => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  // Get all patients for selection
  const patientsResult = await getPatients(1, 100); // Get first 100 patients

  if (!patientsResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading patients: {patientsResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get all available doctors for the selection dropdown
  const doctorsResult = await getAvailableDoctorsForBooking(1, 100); // Get first 100 doctors

  if (!doctorsResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading doctors: {doctorsResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patients: Patient[] = (patientsResult.patients || []).map(
    (item: PatientApiResponse) => ({
      id: item.id,
      userId: item.userId,
      name: item.name || "Unknown Patient",
      email: item.email || "",
      phone: item.phone,
      dateOfBirth: item.dateOfBirth,
    })
  );

  const doctors: Doctor[] = doctorsResult.doctors || [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Book Appointment for Patient
              </h1>
              <p className="text-blue-100 mt-1">
                Schedule appointments on behalf of patients with healthcare
                providers
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {patients.length}
                </p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {doctors.length}
                </p>
                <p className="text-sm text-gray-600">Available Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Doctors Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <span>Available Healthcare Providers</span>
          </CardTitle>
          <CardDescription>
            Choose from our qualified doctors and specialists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {doctors.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.specialty}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{item.yearsOfExperience || 0} years exp.</span>
                      {item.departmentName && (
                        <>
                          <span>•</span>
                          <span>{item.departmentName}</span>
                        </>
                      )}
                    </div>
                    {item.consultationFee && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-green-600">
                          ${item.consultationFee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {doctors.length > 6 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                And {doctors.length - 6} more healthcare providers available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Schedule Appointment</span>
          </CardTitle>
          <CardDescription>
            Select a patient and healthcare provider to book an appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminBookAppointmentForm
            patients={patients}
            doctors={doctors}
            user={user}
          />
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Booking Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Patient Consent:</strong> Ensure you have patient
                consent or authorization to book appointments on their behalf.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Urgency Levels:</strong> Use appropriate appointment
                types (urgent, follow-up, consultation) based on patient needs.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Documentation:</strong> Include relevant patient
                symptoms, medical history, and appointment purpose in the notes.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Confirmation:</strong> Both patient and doctor will
                receive confirmation notifications for the appointment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookAppointmentPage;
