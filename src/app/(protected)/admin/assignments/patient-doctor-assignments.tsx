"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  UserCheck,
  Users,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import {
  getPatients,
  getDoctors,
  assignPatientToDoctor,
  unassignPatientFromDoctor,
  getAllPatientDoctorAssignments,
} from "@/actions";
import { toast } from "sonner";

interface Patient {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodType: string | null;
  healthScore: number | null;
  total?: number;
}

interface Doctor {
  id: number;
  userId: string;
  name: string;
  email: string;
  specialty: string;
  departmentName: string | null;
  total?: number;
}

interface Assignment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  assignedAt: Date;
  assignedBy: string;
  notes: string | null;
  isActive: boolean;
}

export default function PatientDoctorAssignments() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [viewMode, setViewMode] = useState<
    "assignments" | "patients" | "doctors"
  >("assignments");

  const loadData = useCallback(async () => {
    try {
      // Load patients
      const patientsResult = await getPatients(1, 100, "");
      if (patientsResult.success) {
        setPatients(patientsResult.patients || []);
      }

      // Load doctors
      const doctorsResult = await getDoctors(1, 100, "");
      if (doctorsResult.success) {
        setDoctors(doctorsResult.doctors || []);
      }

      // Load assignments
      const assignmentsResult = await getAllPatientDoctorAssignments(1, 100);
      if (assignmentsResult.success) {
        setAssignments(assignmentsResult.assignments || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Failed to load data", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignPatient = async () => {
    if (!selectedPatient || !selectedDoctor) {
      toast.error("Please select both patient and doctor");
      return;
    }

    try {
      const result = await assignPatientToDoctor(
        parseInt(selectedPatient),
        parseInt(selectedDoctor),
        assignmentNotes.trim() || undefined
      );

      if (result.success) {
        toast.success("Patient assigned to doctor successfully");
        setShowAssignDialog(false);
        setSelectedPatient("");
        setSelectedDoctor("");
        setAssignmentNotes("");
        loadData(); // Refresh data
      } else {
        toast.error(result.error || "Failed to assign patient");
      }
    } catch (error) {
      console.error("Failed to assign patient:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleUnassignPatient = async (patientId: number, doctorId: number) => {
    try {
      const result = await unassignPatientFromDoctor(patientId, doctorId);

      if (result.success) {
        toast.success("Patient unassigned from doctor successfully");
        loadData(); // Refresh data
      } else {
        toast.error(result.error || "Failed to unassign patient");
      }
    } catch (error) {
      console.error("Failed to unassign patient:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient-Doctor Assignments</h1>
          <p className="text-muted-foreground">
            Assign patients to doctors for dedicated care management
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={viewMode}
            onValueChange={(value: "assignments" | "patients" | "doctors") =>
              setViewMode(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assignments">All Assignments</SelectItem>
              <SelectItem value="patients">By Patient</SelectItem>
              <SelectItem value="doctors">By Doctor</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Patient to Doctor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
                          {patient.name} - {patient.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select
                    value={selectedDoctor}
                    onValueChange={setSelectedDoctor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem
                          key={doctor.id}
                          value={doctor.id.toString()}
                        >
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Assignment Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Add any special notes about this assignment..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAssignPatient}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Assign Patient
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  {patients.length}
                </p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {doctors.length}
                </p>
                <p className="text-sm text-gray-600">Total Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <LinkIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">
                  {assignments.length}
                </p>
                <p className="text-sm text-gray-600">Active Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(
                    (assignments.length / Math.max(patients.length, 1)) * 100
                  )}
                  %
                </p>
                <p className="text-sm text-gray-600">Assignment Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Assignment List */}
          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{assignment.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {assignment.patientEmail}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">assigned to</p>
                      </div>
                      <div>
                        <p className="font-medium">{assignment.doctorName}</p>
                        <p className="text-sm text-gray-500">
                          {assignment.doctorSpecialty}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUnassignPatient(
                          assignment.patientId,
                          assignment.doctorId
                        )
                      }
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Unassign
                    </Button>
                  </div>
                  {assignment.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Notes:</strong> {assignment.notes}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found</p>
                <p className="text-sm text-gray-400">
                  Create assignments to connect patients with their dedicated
                  doctors
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
