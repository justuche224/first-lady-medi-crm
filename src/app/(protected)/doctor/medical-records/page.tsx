"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  Stethoscope,
  ClipboardList,
  Trash2,
} from "lucide-react";
import { getMedicalRecords, deleteMedicalRecord } from "@/actions";
import { CreateMedicalRecordForm } from "@/components/doctor/medical-record-form";
import { MedicalRecordDetails } from "@/components/doctor/medical-record-details";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicalRecordData {
  record: {
    id: number;
    patientId: number;
    doctorId: number | null;
    appointmentId: number | null;
    recordType: string;
    title: string;
    description: string | null;
    diagnosis: string | null;
    treatment: string | null;
    medications: string | null;
    labTests: string | null;
    vitalSigns: string | null;
    attachments: string | null;
    isConfidential: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  patient: {
    id: number | null;
    userId: string | null;
    name: string | null;
  };
  doctor: {
    id: number | null;
    userId: string | null;
    name: string | null;
    specialty: string | null;
  };
  appointment: {
    id: number;
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    duration: number | null;
    type: string;
    status: string | null;
    reason: string | null;
    symptoms: string | null;
    notes: string | null;
    diagnosis: string | null;
    prescription: string | null;
    followUpRequired: boolean | null;
    followUpDate: string | null;
    cancelledBy: string | null;
    cancelReason: string | null;
    rescheduledFrom: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  total?: number;
}

const DoctorMedicalRecordsPage = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<MedicalRecordData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecordData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");

  // Fetch medical records on component mount
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const result = await getMedicalRecords();
      if (result.success) {
        setMedicalRecords(result.records || []);
      } else {
        setError(result.error || null);
      }
    } catch {
      setError("Failed to fetch medical records");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      const result = await deleteMedicalRecord(recordId);
      if (result.success) {
        fetchMedicalRecords(); // Refresh the list
      } else {
        setError(result.error || null);
      }
    } catch {
      setError("Failed to delete medical record");
    }
  };

  const handleViewDetails = (record: MedicalRecordData) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const handleEditRecord = (record: MedicalRecordData) => {
    setEditingRecord(record);
    setShowCreateForm(true);
  };

  // Filter records based on search and filters
  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      record.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record?.diagnosis
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType =
      recordTypeFilter === "all" ||
      record.record?.recordType === recordTypeFilter;

    return matchesSearch && matchesType;
  });

  const recentRecords = filteredRecords.slice(0, 3);
  const pendingRecords: MedicalRecordData[] = []; // No status field in medical records
  const confidentialRecords = filteredRecords.filter(
    (record) => record.record?.isConfidential
  );

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "diagnosis":
        return "bg-green-100 text-green-800";
      case "treatment":
        return "bg-purple-100 text-purple-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "follow-up":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    totalRecords: filteredRecords.length,
    recentRecords: recentRecords.length,
    pendingRecords: pendingRecords.length,
    confidentialRecords: confidentialRecords.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medical Records</h1>
              <p className="text-green-100 mt-1">
                Create and manage patient medical records
              </p>
            </div>
          </div>
          <Dialog
            open={showCreateForm}
            onOpenChange={(open) => {
              setShowCreateForm(open);
              if (!open) {
                setEditingRecord(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <CreateMedicalRecordForm
                record={editingRecord}
                onSuccess={() => {
                  setShowCreateForm(false);
                  setEditingRecord(null);
                  fetchMedicalRecords();
                }}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingRecord(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalRecords}
                </p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {stats.recentRecords}
                </p>
                <p className="text-sm text-gray-600">Recent Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingRecords}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">
                  {stats.confidentialRecords}
                </p>
                <p className="text-sm text-gray-600">Confidential</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="confidential">Confidential</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Medical Records</CardTitle>
              <CardDescription>
                Complete list of patient medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search records by patient name, diagnosis, or record type..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={recordTypeFilter}
                  onValueChange={setRecordTypeFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="treatment">Treatment</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
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
                      <TableHead>Record Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading medical records...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-red-600"
                        >
                          Error: {error}
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No medical records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.record.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback>
                                  {record.patient?.name
                                    ?.split(" ")
                                    ?.map((n) => n[0])
                                    ?.join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {record.patient?.name || "Unknown Patient"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Patient ID: {record.patient?.id || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getRecordTypeColor(
                                record.record?.recordType || "consultation"
                              )}
                            >
                              {record.record?.recordType || "consultation"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {record.record?.title || "Untitled Record"}
                              </p>
                              {record.record?.isConfidential && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  Confidential
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.record?.diagnosis || "No diagnosis"}
                          </TableCell>
                          <TableCell>
                            {record.record?.createdAt
                              ? new Date(
                                  record.record.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(record)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRecord(record)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Medical Record
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      medical record? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteRecord(record.record?.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Record Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRecord && (
              <MedicalRecordDetails
                record={selectedRecord}
                onClose={() => setShowDetails(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};

export default DoctorMedicalRecordsPage;
