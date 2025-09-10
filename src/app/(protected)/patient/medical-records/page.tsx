import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getMedicalRecords } from "@/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  Calendar,
  Stethoscope,
  Pill,
  TestTube,
  Heart,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface SearchParams {
  page?: string;
  recordType?: string;
  search?: string;
}

const MedicalRecordsPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  const page = parseInt(searchParams.page || "1");
  const recordType = searchParams.recordType || "";
  const search = searchParams.search || "";

  // Get medical records data
  const recordsResult = await getMedicalRecords(
    undefined, // patientId - will be determined by user role
    page,
    20,
    recordType || undefined
  );

  if (!recordsResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading medical records: {recordsResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    records = [],
    pagination = {
      totalPages: 0,
      page: 1,
      limit: 20,
      total: 0,
      hasPrev: false,
      hasNext: false,
    },
  } = recordsResult;

  const getRecordTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return <Stethoscope className="h-4 w-4" />;
      case "diagnosis":
        return <FileText className="h-4 w-4" />;
      case "treatment":
        return <Heart className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "lab_test":
        return <TestTube className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "diagnosis":
        return "bg-red-100 text-red-800 border-red-200";
      case "treatment":
        return "bg-green-100 text-green-800 border-green-200";
      case "medication":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "lab_test":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const parseJsonField = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  // Group records by type for stats
  const recordsByType = records.reduce(
    (acc: Record<string, number>, record) => {
      const type = record.record.recordType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medical Records</h1>
              <p className="text-emerald-100 mt-1">
                View your complete medical history and treatment records
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medical records..."
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>
            <Select defaultValue={recordType}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Records</SelectItem>
                <SelectItem value="consultation">Consultations</SelectItem>
                <SelectItem value="diagnosis">Diagnoses</SelectItem>
                <SelectItem value="treatment">Treatments</SelectItem>
                <SelectItem value="medication">Medications</SelectItem>
                <SelectItem value="lab_test">Lab Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {records.length}
                </p>
                <p className="text-sm text-gray-600">Total Records</p>
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
                  {recordsByType.consultation || 0}
                </p>
                <p className="text-sm text-gray-600">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {recordsByType.diagnosis || 0}
                </p>
                <p className="text-sm text-gray-600">Diagnoses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {recordsByType.medication || 0}
                </p>
                <p className="text-sm text-gray-600">Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {recordsByType.lab_test || 0}
                </p>
                <p className="text-sm text-gray-600">Lab Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Records List */}
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((item) => {
            const medications = parseJsonField(item.record.medications);
            const labTests = parseJsonField(item.record.labTests);
            const vitalSigns = parseJsonField(item.record.vitalSigns);

            return (
              <Card
                key={item.record.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-2 rounded-full ${getRecordTypeColor(
                          item.record.recordType
                        )
                          .replace("text-", "text-")
                          .replace("border-", "")
                          .replace("bg-", "bg-")}`}
                      >
                        {getRecordTypeIcon(item.record.recordType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {item.record.title}
                          </h3>
                          <Badge
                            className={getRecordTypeColor(
                              item.record.recordType
                            )}
                          >
                            {item.record.recordType
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                          {item.record.isConfidential && (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-800 border-yellow-200"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Confidential
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Dr. {item.doctor?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(item.record.createdAt.toISOString())}
                            </span>
                          </div>
                        </div>

                        {item.record.description && (
                          <p className="text-gray-700 mb-3">
                            {item.record.description}
                          </p>
                        )}

                        {/* Diagnosis */}
                        {item.record.diagnosis && (
                          <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-medium text-red-800 mb-1">
                              Diagnosis
                            </h4>
                            <p className="text-red-700 text-sm">
                              {item.record.diagnosis}
                            </p>
                          </div>
                        )}

                        {/* Treatment */}
                        {item.record.treatment && (
                          <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-1">
                              Treatment
                            </h4>
                            <p className="text-green-700 text-sm">
                              {item.record.treatment}
                            </p>
                          </div>
                        )}

                        {/* Medications */}
                        {medications &&
                          Array.isArray(medications) &&
                          medications.length > 0 && (
                            <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <h4 className="font-medium text-purple-800 mb-2">
                                Medications
                              </h4>
                              <div className="space-y-1">
                                {medications.map(
                                  (
                                    med:
                                      | string
                                      | { name: string; dosage: string },
                                    index: number
                                  ) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 text-sm"
                                    >
                                      <Pill className="h-3 w-3 text-purple-600" />
                                      <span className="text-purple-700">
                                        {typeof med === "string"
                                          ? med
                                          : `${med.name} - ${med.dosage}`}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Lab Tests */}
                        {labTests &&
                          Array.isArray(labTests) &&
                          labTests.length > 0 && (
                            <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <h4 className="font-medium text-orange-800 mb-2">
                                Lab Tests Ordered
                              </h4>
                              <div className="space-y-1">
                                {labTests.map(
                                  (
                                    test: string | { name: string },
                                    index: number
                                  ) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 text-sm"
                                    >
                                      <TestTube className="h-3 w-3 text-orange-600" />
                                      <span className="text-orange-700">
                                        {typeof test === "string"
                                          ? test
                                          : test.name}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Vital Signs */}
                        {vitalSigns &&
                          typeof vitalSigns === "object" &&
                          Object.entries(vitalSigns).length > 0 && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-medium text-blue-800 mb-2">
                                Vital Signs
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                {Object.entries(vitalSigns)
                                  .filter(([, value]) => value !== undefined)
                                  .map(([key, value]) => (
                                    <div key={key} className="text-blue-700">
                                      <span className="font-medium capitalize">
                                        {key.replace("_", " ")}:{" "}
                                      </span>
                                      <span>{String(value)}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Related Appointment Info */}
                  {item.appointment && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Related to appointment on{" "}
                        {formatDate(item.appointment.appointmentDate)} at{" "}
                        {item.appointment.appointmentTime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No medical records found
              </h3>
              <p className="text-gray-600 mb-4">
                Your medical records will appear here as you visit doctors and
                receive care.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} records
          </p>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${pagination.page - 1}&recordType=${recordType}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${pagination.page + 1}&recordType=${recordType}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
