import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getMedications } from "@/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Info,
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
  status?: string;
  search?: string;
}

const MedicationsPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  const page = parseInt(searchParams.page || "1");
  const status = searchParams.status || "all";
  const search = searchParams.search || "";

  // Get medications data
  const medicationsResult = await getMedications(
    undefined, // patientId - will be determined by user role
    page,
    20,
    status === "all"
      ? undefined
      : (status as "completed" | "active" | "discontinued" | undefined)
  );

  if (!medicationsResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading medications: {medicationsResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    medications = [],
    pagination = {
      totalPages: 0,
      page: 1,
      limit: 20,
      total: 0,
      hasPrev: false,
      hasNext: false,
    },
  } = medicationsResult;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "discontinued":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "discontinued":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Pill className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    return end < today;
  };

  // Filter medications by status for stats
  const activeMedications = medications.filter(
    (med) => med.medication.status === "active"
  );
  const completedMedications = medications.filter(
    (med) => med.medication.status === "completed"
  );
  const discontinuedMedications = medications.filter(
    (med) => med.medication.status === "discontinued"
  );
  const expiringMedications = activeMedications.filter((med) =>
    isExpiringSoon(med.medication.endDate)
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Medications</h1>
              <p className="text-purple-100 mt-1">
                Manage your prescriptions and medication history
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Request Refill
          </Button>
        </div>
      </div>

      {/* Alerts for expiring medications */}
      {expiringMedications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800">
                  Medications Expiring Soon
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {expiringMedications.length} medication(s) will expire within
                  the next 7 days. Consider contacting your doctor for refills.
                </p>
                <div className="mt-2 space-y-1">
                  {expiringMedications.map((med) => (
                    <p
                      key={med.medication.id}
                      className="text-sm text-orange-700"
                    >
                      • {med.medication.name} - expires{" "}
                      {formatDate(med.medication.endDate)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medications..."
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>
            <Select defaultValue={status}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Medications</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {activeMedications.length}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {expiringMedications.length}
                </p>
                <p className="text-sm text-gray-600">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {completedMedications.length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {discontinuedMedications.length}
                </p>
                <p className="text-sm text-gray-600">Discontinued</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medications List */}
      {medications.length > 0 ? (
        <div className="space-y-4">
          {medications.map((item) => {
            const isExpiringSoonFlag = isExpiringSoon(item.medication.endDate);
            const isExpiredFlag = isExpired(item.medication.endDate);

            return (
              <Card
                key={item.medication.id}
                className={`hover:shadow-md transition-shadow ${
                  isExpiringSoonFlag
                    ? "border-orange-200 bg-orange-50/50"
                    : isExpiredFlag
                    ? "border-red-200 bg-red-50/50"
                    : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div
                        className={`p-3 rounded-full ${
                          item.medication.status === "active"
                            ? "bg-green-100"
                            : item.medication.status === "completed"
                            ? "bg-blue-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Pill
                          className={`h-5 w-5 ${
                            item.medication.status === "active"
                              ? "text-green-600"
                              : item.medication.status === "completed"
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {item.medication.name}
                            </h3>
                            {item.medication.genericName && (
                              <p className="text-sm text-gray-600">
                                Generic: {item.medication.genericName}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <Badge
                              className={getStatusColor(
                                item.medication.status || ""
                              )}
                            >
                              {getStatusIcon(item.medication.status || "")}
                              <span className="ml-1 capitalize">
                                {item.medication.status}
                              </span>
                            </Badge>

                            {isExpiringSoonFlag && (
                              <Badge
                                variant="outline"
                                className="bg-orange-100 text-orange-800 border-orange-300"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}

                            {isExpiredFlag && (
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 border-red-300"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Pill className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Dosage:</span>
                              <span>{item.medication.dosage}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Frequency:</span>
                              <span>{item.medication.frequency}</span>
                            </div>
                            {item.medication.duration && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Duration:</span>
                                <span>{item.medication.duration}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Start Date:</span>
                              <span>
                                {formatDate(item.medication.startDate)}
                              </span>
                            </div>
                            {item.medication.endDate && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">End Date:</span>
                                <span>
                                  {formatDate(item.medication.endDate)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm">
                              <RefreshCw className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Refills:</span>
                              <span>
                                {item.medication.refills || 0} remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        {item.medication.instructions && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-1">
                              Instructions
                            </h4>
                            <p className="text-blue-700 text-sm">
                              {item.medication.instructions}
                            </p>
                          </div>
                        )}

                        {/* Side Effects */}
                        {item.medication.sideEffects && (
                          <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-800 mb-1">
                              Side Effects
                            </h4>
                            <p className="text-yellow-700 text-sm">
                              {item.medication.sideEffects}
                            </p>
                          </div>
                        )}

                        {/* Prescribed By */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>Prescribed by Dr. {item.doctor?.name}</span>
                          <span>•</span>
                          <span>
                            {formatDate(
                              item.medication.createdAt.toISOString()
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Info className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                      {item.medication.status === "active" &&
                        item.medication.refills &&
                        item.medication.refills > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Request Refill
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No medications found
              </h3>
              <p className="text-gray-600 mb-4">
                Your prescribed medications will appear here when doctors
                prescribe them for you.
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
            {pagination.total} medications
          </p>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page - 1}&status=${status}`}>
                  Previous
                </Link>
              </Button>
            )}
            {pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page + 1}&status=${status}`}>
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

export default MedicationsPage;
