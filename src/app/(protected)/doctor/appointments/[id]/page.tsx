import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  TestTube,
  Save,
  Edit,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface AppointmentDetailsPageProps {
  params: {
    id: string;
  };
}

const AppointmentDetailsPage = async ({
  params,
}: AppointmentDetailsPageProps) => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  const appointmentId = parseInt(params.id);

  // Mock appointment data - in real app, fetch from database
  const appointment = {
    id: appointmentId,
    patient: {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      age: 34,
      gender: "Female",
      bloodType: "A+",
      image: null,
    },
    date: "2024-01-18",
    time: "09:00 AM",
    duration: 30,
    type: "Follow-up",
    status: "confirmed",
    reason: "Blood pressure monitoring",
    symptoms: "Mild headaches, occasional dizziness",
    priority: "normal",
    isUrgent: false,
    notes: "",
    diagnosis: "",
    prescription: "",
    followUpRequired: false,
    followUpDate: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      oxygenSaturation: "",
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "scheduled":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage
                src={appointment.patient.image || ""}
                alt={appointment.patient.name}
              />
              <AvatarFallback className="text-lg bg-blue-500">
                {appointment.patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Appointment Details</h1>
              <p className="text-blue-100 text-lg">
                {appointment.patient.name}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1 capitalize">{appointment.status}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge
              className={getStatusColor(appointment.status)}
              variant="secondary"
            >
              {appointment.status}
            </Badge>
            {appointment.isUrgent && (
              <div className="flex items-center justify-end mt-2 text-yellow-300">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-sm">Urgent</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="prescription">Prescription</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Appointment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Date
                    </Label>
                    <p className="font-semibold">{appointment.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Time
                    </Label>
                    <p className="font-semibold">{appointment.time}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Duration
                    </Label>
                    <p className="font-semibold">
                      {appointment.duration} minutes
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Type
                    </Label>
                    <p className="font-semibold">{appointment.type}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Reason for Visit
                  </Label>
                  <p className="font-semibold mt-1">{appointment.reason}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Symptoms
                  </Label>
                  <p className="text-gray-700 mt-1">{appointment.symptoms}</p>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={appointment.patient.image || ""} />
                    <AvatarFallback>
                      {appointment.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {appointment.patient.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {appointment.patient.age} years,{" "}
                      {appointment.patient.gender}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{appointment.patient.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{appointment.patient.phone}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Blood Type
                  </Label>
                  <Badge variant="outline" className="ml-2">
                    {appointment.patient.bloodType}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/doctor/patients/${appointment.patient.id}`}>
                      View Full Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Vital Signs
              </CardTitle>
              <CardDescription>
                Record patient&apos;s vital signs during the appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure</Label>
                  <Input
                    id="bloodPressure"
                    placeholder="120/80"
                    value={appointment.vitalSigns.bloodPressure}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    placeholder="72"
                    value={appointment.vitalSigns.heartRate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    placeholder="98.6"
                    value={appointment.vitalSigns.temperature}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    placeholder="150"
                    value={appointment.vitalSigns.weight}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (ft/in)</Label>
                  <Input
                    id="height"
                    placeholder="5'6&quot;"
                    value={appointment.vitalSigns.height}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">
                    Oxygen Saturation (%)
                  </Label>
                  <Input
                    id="oxygenSaturation"
                    placeholder="98"
                    value={appointment.vitalSigns.oxygenSaturation}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Vital Signs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Clinical Notes
              </CardTitle>
              <CardDescription>
                Document your observations, findings, and clinical notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={appointment.diagnosis}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter clinical notes, observations, and findings..."
                  value={appointment.notes}
                  rows={6}
                />
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Prescription
              </CardTitle>
              <CardDescription>
                Prescribe medications and treatment plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prescription">Prescription Details</Label>
                <Textarea
                  id="prescription"
                  placeholder="Enter prescription details, medications, dosages, and instructions..."
                  value={appointment.prescription}
                  rows={6}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <Pill className="h-4 w-4 mr-2" />
                  Add to Patient Medications
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Prescription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="follow-up" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Follow-up Care
              </CardTitle>
              <CardDescription>
                Schedule follow-up appointments and care instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={appointment.followUpRequired}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="followUpRequired">
                  Follow-up appointment required
                </Label>
              </div>

              {appointment.followUpRequired && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={appointment.followUpDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpInstructions">
                      Follow-up Instructions
                    </Label>
                    <Textarea
                      id="followUpInstructions"
                      placeholder="Enter follow-up care instructions..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Follow-up Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/doctor/appointments">Back to Appointments</Link>
          </Button>
        </div>
        <div className="flex space-x-2">
          {appointment.status !== "completed" && (
            <>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Appointment
              </Button>
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            </>
          )}
          {appointment.status === "completed" && (
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
