import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { getDoctorPatients } from "@/actions";

const DoctorPatientsPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "doctor") {
    redirect("/dashboard");
  }

  // Fetch live patients data
  const patientsResult = await getDoctorPatients(1, 50); // Get first 50 patients

  if (!patientsResult.success) {
    console.error("Error loading patients:", patientsResult.error);
  }

  const patientsData = patientsResult.success ? patientsResult.patients : [];

  // Transform the data to match the expected format
  const patients = (patientsData || []).map((item) => {
    const patient = item.patient;
    const age = patient.dateOfBirth
      ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
      : null;

    return {
      id: patient.id,
      name: patient.name || "Unknown Patient",
      email: patient.email || "No email",
      phone: patient.phone || "No phone",
      age,
      gender: patient.gender || "Not specified",
      bloodType: patient.bloodType || "Unknown",
      lastVisit: item.lastAppointment
        ? new Date(item.lastAppointment).toISOString().split("T")[0]
        : null,
      nextAppointment: null, // Would need additional query for next appointment
      condition: patient.allergies || "No known conditions",
      status: "active", // All patients are active
      riskLevel: patient.healthScore
        ? patient.healthScore < 30
          ? "high"
          : patient.healthScore < 70
          ? "medium"
          : "low"
        : "medium",
      image: null,
      totalAppointments: item.totalAppointments || 0,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "stable":
        return "bg-blue-100 text-blue-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Activity className="h-4 w-4" />;
      case "low":
        return <Heart className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter((p) => p.status === "active").length,
    criticalPatients: patients.filter((p) => p.status === "critical").length,
    upcomingAppointments: patients.filter((p) => p.nextAppointment).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Patients</h1>
              <p className="text-blue-100 mt-1">
                Manage and monitor your patients&apos; health records
              </p>
            </div>
          </div>
          <Button variant="secondary" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalPatients}
                </p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {stats.activePatients}
                </p>
                <p className="text-sm text-gray-600">Active Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">
                  {stats.criticalPatients}
                </p>
                <p className="text-sm text-gray-600">Critical Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.upcomingAppointments}
                </p>
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>
            Search and filter through your patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name, email, or condition..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Patients Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Next Appointment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={patient.image || ""} />
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              ID: {patient.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {patient.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{patient.age} years</p>
                          <p className="text-sm text-gray-500">
                            {patient.gender}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.bloodType}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{patient.condition}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center ${getRiskColor(
                            patient.riskLevel
                          )}`}
                        >
                          {getRiskIcon(patient.riskLevel)}
                          <span className="ml-1 capitalize">
                            {patient.riskLevel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{patient.lastVisit}</p>
                      </TableCell>
                      <TableCell>
                        {patient.nextAppointment ? (
                          <p className="text-sm">{patient.nextAppointment}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Not scheduled</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctor/patients/${patient.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No patients found</p>
                        <p className="text-sm text-gray-400">
                          Patients will appear here once you have appointments
                          with them.
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
    </div>
  );
};

export default DoctorPatientsPage;
