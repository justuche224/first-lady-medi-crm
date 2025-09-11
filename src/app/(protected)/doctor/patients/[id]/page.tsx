import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  User,
  Calendar,
  FileText,
  Pill,
  TestTube,
  Activity,
  Heart,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Edit,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  getDoctorPatientDetails,
  getDoctorPatientAppointments,
  getDoctorPatientMedications,
  getDoctorPatientLabResults,
  getDoctorPatientVitalSigns,
} from "@/actions";

interface PatientDetailsPageProps {
  params: {
    id: string;
  };
}

const PatientDetailsPage = async ({ params }: PatientDetailsPageProps) => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "doctor") {
    redirect("/dashboard");
  }

  const patientId = parseInt(params.id);

  // Fetch real patient data
  const [
    patientResult,
    appointmentsResult,
    medicationsResult,
    labResultsResult,
    vitalSignsResult,
  ] = await Promise.all([
    getDoctorPatientDetails(patientId),
    getDoctorPatientAppointments(patientId),
    getDoctorPatientMedications(patientId),
    getDoctorPatientLabResults(patientId),
    getDoctorPatientVitalSigns(patientId),
  ]);

  if (!patientResult.success) {
    console.error("Error loading patient details:", patientResult.error);
    redirect("/doctor/patients");
  }

  const patient = patientResult.success ? patientResult.patient : null;
  const appointments = appointmentsResult.success
    ? appointmentsResult.appointments || []
    : [];
  const medications = medicationsResult.success
    ? medicationsResult.medications || []
    : [];
  const patientLabResults = labResultsResult.success
    ? labResultsResult.labResults
    : [];
  const patientVitalSigns = vitalSignsResult.success
    ? vitalSignsResult.vitalSigns
    : [];

  // Fallback if no data available
  if (!patient) {
    redirect("/doctor/patients");
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 border-4 border-white">
              <AvatarImage src={patient.image || ""} alt={patient.name} />
              <AvatarFallback className="text-xl bg-blue-500">
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{patient.name}</h1>
              <p className="text-blue-100">Patient ID: {patient.id}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>
                    {patient.age} years, {patient.gender}
                  </span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  <span>Blood Type: {patient.bloodType}</span>
                </div>
                <div
                  className={`flex items-center ${getRiskColor(
                    patient.riskLevel
                  )}`}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="capitalize">{patient.riskLevel} Risk</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              <Heart className="h-5 w-5 mr-2" />
              <span className="text-lg font-semibold">
                Health Score: {patient.healthScore}%
              </span>
            </div>
            <Badge className={getStatusColor(patient.status)}>
              {patient.status}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{patient.address}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">Emergency Contact</p>
                  <p className="text-sm text-gray-600">
                    {patient.emergencyContact}
                  </p>
                  <p className="text-sm text-gray-600">
                    {patient.emergencyPhone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Medical Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Medical Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Allergies</p>
                  <p className="text-sm text-red-600">{patient.allergies}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Medical History</p>
                  <p className="text-sm text-gray-600">
                    {patient.medicalHistory}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Insurance</p>
                  <p className="text-sm text-gray-600">
                    {patient.insuranceProvider}
                  </p>
                  <p className="text-sm text-gray-500">
                    {patient.insuranceNumber}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Medical Record
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Pill className="mr-2 h-4 w-4" />
                  Prescribe Medication
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TestTube className="mr-2 h-4 w-4" />
                  Order Lab Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>
                  Recent and upcoming appointments
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length > 0 ? (
                      appointments.map((item) => {
                        const appointment = item.appointment;
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {new Date(
                                    appointment.appointmentDate
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {appointment.appointmentTime}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.type}</TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(
                                  appointment.status || "pending"
                                )}
                              >
                                {appointment.status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {appointment.diagnosis || "Not diagnosed"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {appointment.notes || "No notes"}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/doctor/appointments/${appointment.id}`}
                                >
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Calendar className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">
                              No appointments found
                            </p>
                            <p className="text-sm text-gray-400">
                              Appointment history will appear here once
                              scheduled.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>
                  Active prescriptions and medications
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Prescribe New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.length > 0 ? (
                  medications.map((item) => {
                    const medication = item.medication;
                    return (
                      <div
                        key={medication.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Pill className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{medication.name}</h4>
                            <p className="text-sm text-gray-600">
                              {medication.dosage} - {medication.frequency}
                            </p>
                            <p className="text-sm text-gray-500">
                              For:{" "}
                              {medication.instructions ||
                                "No specific indication"}{" "}
                              | Since:{" "}
                              {new Date(
                                medication.startDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getStatusColor(
                              medication.status || "pending"
                            )}
                          >
                            {medication.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No medications prescribed</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Prescribed medications will appear here once added.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-results" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Laboratory Results</CardTitle>
                <CardDescription>
                  Recent test results and findings
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Order New Test
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientLabResults && patientLabResults.length > 0 ? (
                  patientLabResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <TestTube className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{result.testName}</h4>
                          <p className="text-sm text-gray-600">
                            {result.results}
                          </p>
                          <p className="text-sm text-gray-500">
                            {result.resultDate} | {result.notes}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={getStatusColor(result.status || "pending")}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No lab results available</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Lab results will appear here once tests are ordered and
                      completed.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs History</CardTitle>
              <CardDescription>Recent vital signs measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Blood Pressure</TableHead>
                      <TableHead>Heart Rate</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientVitalSigns && patientVitalSigns.length > 0 ? (
                      patientVitalSigns.map((vital, index) => {
                        if (!vital) return null;
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {new Date(vital.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {vital.vitalSigns?.bp || "N/A"}
                            </TableCell>
                            <TableCell>
                              {vital.vitalSigns?.hr
                                ? `${vital.vitalSigns.hr} bpm`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {vital.vitalSigns?.temp || "N/A"}
                            </TableCell>
                            <TableCell>
                              {vital.vitalSigns?.weight || "N/A"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Activity className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">
                              No vital signs recorded
                            </p>
                            <p className="text-sm text-gray-400">
                              Vital signs will appear here once recorded during
                              appointments.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>
                  Complete medical documentation
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Medical records will be displayed here. Click &quot;Add
                Record&quot; to create a new medical record.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetailsPage;
