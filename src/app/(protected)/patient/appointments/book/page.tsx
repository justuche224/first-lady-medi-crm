import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAvailableDoctorsForBooking, getCurrentPatient } from "@/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  ArrowLeft,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { BookAppointmentForm } from "./book-appointment-form";

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

interface SearchParams {
  doctorId?: string;
  date?: string;
}

const BookAppointmentPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  // Get current patient information
  const patientResult = await getCurrentPatient();

  if (!patientResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading patient information: {patientResult.error}
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

  const doctors: Doctor[] = doctorsResult.doctors || [];
  const currentPatient = patientResult.patient;

  if (!currentPatient) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Patient information not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-selected doctor if coming from a specific doctor page
  const selectedDoctorId = (await searchParams).doctorId
    ? parseInt((await searchParams).doctorId!)
    : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Book Appointment</h1>
              <p className="text-green-100 mt-1">
                Schedule your consultation with our healthcare professionals
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/patient/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Link>
          </Button>
        </div>
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
                        <Badge variant="outline" className="text-green-600">
                          ${item.consultationFee}
                        </Badge>
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
            <Calendar className="h-5 w-5 text-green-600" />
            <span>Schedule Your Appointment</span>
          </CardTitle>
          <CardDescription>
            Fill out the form below to book your appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookAppointmentForm
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            user={user}
            currentPatient={currentPatient}
          />
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Cancellation Policy:</strong> Please cancel at least 24
                hours in advance to avoid cancellation fees.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Preparation:</strong> Bring your insurance card, ID, and
                any relevant medical records or test results.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Arrival Time:</strong> Please arrive 15 minutes early
                for your appointment to complete any necessary paperwork.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p>
                <strong>Confirmation:</strong> You will receive a confirmation
                email with appointment details and any specific instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointmentPage;
