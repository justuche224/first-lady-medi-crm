"use client";

import React, { useState, useEffect } from "react";
import {
  Pill,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { getMedications, refillMedication } from "@/actions/medication-actions";
import { PrescriptionForm } from "@/components/doctor/prescription-form";
import { getDoctorPatients } from "@/actions/doctor-dashboard-actions";

interface MedicationData {
  medication: {
    id: number;
    patientId: number;
    prescribedBy: number;
    appointmentId?: number | null;
    name: string;
    genericName?: string | null;
    dosage: string;
    frequency: string;
    duration?: string | null;
    instructions?: string | null;
    startDate: string;
    endDate?: string | null;
    refills: number | null;
    sideEffects?: string | null;
    status: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  patient: {
    id: number;
    userId: string;
    name: string;
    age?: number;
  };
  doctor: {
    id: number;
    userId: string;
    name: string;
    specialty?: string;
  };
  appointment?: {
    id: number;
    appointmentDate: string;
    type: string;
  } | null;
}

interface Patient {
  id: number;
  name: string;
  age?: number;
}

const DoctorMedicationsPage = () => {
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [refillingMedicationId, setRefillingMedicationId] = useState<
    number | null
  >(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load medications
      const medicationsResult = await getMedications();
      if (medicationsResult.success) {
        setMedications(
          (medicationsResult.medications || []) as unknown as MedicationData[]
        );
      } else {
        setError(medicationsResult.error || "Failed to load medications");
      }

      // Load patients for prescription form
      const patientsResult = await getDoctorPatients();
      if (patientsResult.success) {
        // Transform patient data to match our interface
        const transformedPatients = (patientsResult.patients || [])
          .map((p) => {
            const age = p.patient?.dateOfBirth
              ? Math.floor(
                  (new Date().getTime() -
                    new Date(p.patient.dateOfBirth).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )
              : undefined;

            return {
              id: p.patient?.id || 0,
              name: p.patient?.name || "",
              age: age,
            };
          })
          .filter((p) => p.id && p.name) as Patient[];
        setPatients(transformedPatients);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefillMedication = async (medicationId: number) => {
    setRefillingMedicationId(medicationId);
    try {
      const result = await refillMedication(medicationId);
      if (result.success) {
        toast.success("Refill authorized successfully");
        await loadData(); // Refresh data
      } else {
        toast.error(result.error || "Failed to authorize refill");
      }
    } catch (err) {
      console.error("Error authorizing refill:", err);
      toast.error("Failed to authorize refill");
    } finally {
      setRefillingMedicationId(null);
    }
  };

  // Filter medications based on search and filters
  const filteredMedications = medications.filter((medication) => {
    const matchesSearch =
      medication.medication.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      medication.patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      medication.medication.genericName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || medication.medication.status === statusFilter;
    const matchesPatient =
      patientFilter === "all" ||
      medication.patient.id.toString() === patientFilter;

    return matchesSearch && matchesStatus && matchesPatient;
  });

  const activeMedications = filteredMedications.filter(
    (med) => med.medication.status === "active"
  );
  const needsRefill = filteredMedications.filter(
    (med) => med.medication.status === "needs_refill"
  );
  const requiresMonitoring = filteredMedications.filter(
    (med) =>
      med.medication.status === "active" &&
      (med.medication.sideEffects || med.medication.instructions)
  );
  const recentlyCompleted = filteredMedications.filter(
    (med) => med.medication.status === "completed"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "needs_refill":
        return "bg-yellow-100 text-yellow-800";
      case "discontinued":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "needs_refill":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "discontinued":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "paused":
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const stats = {
    totalMedications: filteredMedications.length,
    activeMedications: activeMedications.length,
    needsRefill: needsRefill.length,
    requiresMonitoring: requiresMonitoring.length,
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading medications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Medications
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medications</h1>
              <p className="text-purple-100 mt-1">
                Manage patient prescriptions and medication history
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowPrescriptionForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalMedications}
                </p>
                <p className="text-sm text-gray-600">Total Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeMedications}
                </p>
                <p className="text-sm text-gray-600">Active Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.needsRefill}
                </p>
                <p className="text-sm text-gray-600">Needs Refill</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.requiresMonitoring}
                </p>
                <p className="text-sm text-gray-600">Requires Monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="refills">Needs Refill</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Medications</CardTitle>
              <CardDescription>
                Currently prescribed and active medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeMedications.map((medication) => (
                  <div
                    key={medication.medication.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-green-100 p-2 rounded-full">
                      <Pill className="h-5 w-5 text-green-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {medication.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {medication.medication.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {medication.medication.dosage} -{" "}
                            {medication.medication.frequency}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getStatusColor(
                              medication.medication.status ?? "active"
                            )}
                          >
                            {medication.medication.status ?? "active"}
                          </Badge>
                          {medication.medication.sideEffects && (
                            <Badge variant="outline">Monitoring Required</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-500">
                          Patient: {medication.patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Duration:{" "}
                          {medication.medication.duration || "Long-term"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Refills: {medication.medication.refills}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Started:{" "}
                        {new Date(
                          medication.medication.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medications Needing Refill</CardTitle>
              <CardDescription>
                Medications that require refill authorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {needsRefill.map((medication) => (
                  <div
                    key={medication.medication.id}
                    className="flex items-center space-x-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                  >
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {medication.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {medication.medication.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {medication.medication.dosage} -{" "}
                            {medication.medication.frequency}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(
                            medication.medication.status ?? "active"
                          )}
                        >
                          {medication.medication.status ?? "active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {medication.patient.name} | Duration:{" "}
                        {medication.medication.duration || "Long-term"}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Low on refills - {medication.medication.refills}{" "}
                        remaining
                      </p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleRefillMedication(medication.medication.id)
                        }
                        disabled={
                          refillingMedicationId === medication.medication.id
                        }
                      >
                        {refillingMedicationId === medication.medication.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Authorize Refill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medications Requiring Monitoring</CardTitle>
              <CardDescription>
                Medications that require regular monitoring and follow-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requiresMonitoring.map((medication) => (
                  <div
                    key={medication.medication.id}
                    className="flex items-center space-x-4 p-4 border border-orange-200 bg-orange-50 rounded-lg"
                  >
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {medication.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {medication.medication.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {medication.medication.dosage} -{" "}
                            {medication.medication.frequency}
                          </p>
                        </div>
                        <Badge variant="outline">Monitoring Required</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {medication.patient.name} | Duration:{" "}
                        {medication.medication.duration || "Long-term"}
                      </p>
                      {medication.medication.sideEffects && (
                        <p className="text-sm text-orange-600 mt-1">
                          Side effects: {medication.medication.sideEffects}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/doctor/patients/${medication.patient.id}`}
                        >
                          View Patient
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Medications</CardTitle>
              <CardDescription>
                Recently completed medication courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Prescribed For</TableHead>
                      <TableHead>Completion Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentlyCompleted.map((medication) => (
                      <TableRow key={medication.medication.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {medication.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {medication.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {medication.patient.age
                                  ? `${medication.patient.age} years`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {medication.medication.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {medication.medication.genericName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{medication.medication.dosage}</TableCell>
                        <TableCell>
                          {medication.medication.duration || "Completed"}
                        </TableCell>
                        <TableCell>
                          {medication.medication.instructions || "N/A"}
                        </TableCell>
                        <TableCell>
                          {medication.medication.endDate
                            ? new Date(
                                medication.medication.endDate
                              ).toLocaleDateString()
                            : "Ongoing"}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Medications</CardTitle>
              <CardDescription>
                Complete medication history and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search medications by name, patient, or condition..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="needs_refill">Needs Refill</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={patientFilter} onValueChange={setPatientFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
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
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage & Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prescribed For</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Refills</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedications.map((medication) => (
                      <TableRow key={medication.medication.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {medication.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {medication.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {medication.patient.age
                                  ? `${medication.patient.age} years`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {medication.medication.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {medication.medication.genericName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {medication.medication.dosage}
                            </p>
                            <p className="text-sm text-gray-500">
                              {medication.medication.frequency}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(
                              medication.medication.status ?? "active"
                            )}
                            <Badge
                              className={getStatusColor(
                                medication.medication.status ?? "active"
                              )}
                            >
                              {medication.medication.status ?? "active"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {medication.medication.instructions ||
                            "No specific instructions"}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            medication.medication.startDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-500">
                            {medication.medication.refills} refills
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {medication.medication.status === "active" && (
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prescription Form Modal */}
      <PrescriptionForm
        open={showPrescriptionForm}
        onOpenChange={setShowPrescriptionForm}
        patients={patients}
        onSuccess={() => {
          loadData();
          setShowPrescriptionForm(false);
        }}
      />
    </div>
  );
};

export default DoctorMedicationsPage;
