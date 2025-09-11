"use client";

import React, { useState, useEffect } from "react";
import {
  TestTube,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
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
import { toast } from "sonner";
import { getLabResults, updateLabResult } from "@/actions/lab-actions";

interface LabTestResult {
  status: string;
  value: string | number;
  unit: string;
  normalRange?: string;
}

interface LabResultData {
  labResult: {
    id: number;
    patientId: number;
    doctorId?: number;
    appointmentId?: number;
    testName: string;
    testCategory: string;
    testDate: string;
    resultDate?: string;
    status: string;
    results?: string;
    normalRange?: string;
    interpretation?: string;
    notes?: string;
    attachments?: string;
    reviewedBy?: number;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  patient: {
    id: number;
    userId: string;
    name: string;
    age?: number;
  };
  doctor?: {
    id: number;
    userId: string;
    name: string;
    specialty?: string;
  };
  appointment?: {
    id: number;
    appointmentDate: string;
    type: string;
  };
}

const DoctorLabResultsPage = () => {
  const [labResults, setLabResults] = useState<LabResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingResultId, setReviewingResultId] = useState<number | null>(
    null
  );

  // Filter states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load lab results (completed/reviewed)
      const resultsResult = await getLabResults();
      if (resultsResult.success) {
        // Filter for only completed/reviewed results
        const completedResults = (resultsResult.labResults || []).filter(
          (result) =>
            result.labResult.status === "completed" ||
            result.labResult.status === "reviewed"
        );
        setLabResults(completedResults as unknown as LabResultData[]);
      } else {
        setError(resultsResult.error || "Failed to load lab results");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewResult = async (
    resultId: number,
    interpretation: string,
    notes: string
  ) => {
    setReviewingResultId(resultId);
    try {
      const result = await updateLabResult(resultId, {
        status: "reviewed",
        interpretation: interpretation,
        notes: notes,
      });

      if (result.success) {
        toast.success("Result reviewed successfully");
        await loadData(); // Refresh data
      } else {
        toast.error(result.error || "Failed to review result");
      }
    } catch (err) {
      console.error("Error reviewing result:", err);
      toast.error("Failed to review result");
    } finally {
      setReviewingResultId(null);
    }
  };

  // Filter lab results based on search and filters
  const filteredLabResults = labResults.filter((result) => {
    const matchesSearch =
      result.labResult.testName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      result.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.labResult.testCategory
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || result.labResult.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      result.labResult.testCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Categorize results
  const pendingReview = filteredLabResults.filter(
    (result) => result.labResult.status === "pending_review"
  );
  const reviewed = filteredLabResults.filter(
    (result) => result.labResult.status === "reviewed"
  );
  const abnormalResults = filteredLabResults.filter(
    (result) =>
      result.labResult.results &&
      (JSON.parse(result.labResult.results) as LabTestResult[]).some(
        (r: LabTestResult) => r.status === "high" || r.status === "low"
      )
  );
  const criticalResults = filteredLabResults.filter(
    (result) => result.labResult.status === "critical"
  );

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
            <span>Loading lab results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Lab Results
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-green-100 text-green-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "high":
        return "text-red-600";
      case "low":
        return "text-blue-600";
      case "critical":
        return "text-red-800 font-bold";
      default:
        return "text-gray-600";
    }
  };

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "low":
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case "normal":
        return <Minus className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const stats = {
    totalResults: labResults.length,
    pendingReview: pendingReview.length,
    abnormalResults: abnormalResults.length,
    criticalResults: criticalResults.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <TestTube className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lab Results</h1>
              <p className="text-indigo-100 mt-1">
                Review and interpret laboratory test results
              </p>
            </div>
          </div>
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
                  {stats.totalResults}
                </p>
                <p className="text-sm text-gray-600">Total Results</p>
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
                  {stats.pendingReview}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.abnormalResults}
                </p>
                <p className="text-sm text-gray-600">Abnormal Results</p>
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
                  {stats.criticalResults}
                </p>
                <p className="text-sm text-gray-600">Critical Values</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="abnormal">Abnormal Results</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="all">All Results</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Lab results awaiting physician review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReview.map((result) => (
                  <div
                    key={result.labResult.id}
                    className="flex items-start space-x-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                  >
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {result.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {result.labResult.testName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {result.labResult.testCategory} | Result Date:{" "}
                            {result.labResult.resultDate
                              ? new Date(
                                  result.labResult.resultDate
                                ).toLocaleDateString()
                              : "Pending"}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(result.labResult.status)}
                        >
                          Needs Review
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Patient: {result.patient.name} | Test Date:{" "}
                        {new Date(
                          result.labResult.testDate
                        ).toLocaleDateString()}
                      </p>
                      {result.labResult.results && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">
                            Key Results:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {Object.entries(
                              JSON.parse(result.labResult.results) as Record<
                                string,
                                LabTestResult
                              >
                            )
                              .slice(0, 3)
                              .map(([key, value]: [string, LabTestResult]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-gray-600">{key}:</span>
                                  <div className="flex items-center space-x-1">
                                    {getResultStatusIcon(value.status)}
                                    <span
                                      className={getResultStatusColor(
                                        value.status
                                      )}
                                    >
                                      {value.value} {value.unit}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleReviewResult(result.labResult.id, "", "")
                        }
                        disabled={reviewingResultId === result.labResult.id}
                      >
                        {reviewingResultId === result.labResult.id ? (
                          <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Review & Sign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abnormal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abnormal Results</CardTitle>
              <CardDescription>
                Test results outside normal reference ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abnormalResults.map((result) => (
                  <div
                    key={result.labResult.id}
                    className="flex items-start space-x-4 p-4 border border-orange-200 bg-orange-50 rounded-lg"
                  >
                    <div className="bg-orange-100 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {result.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {result.labResult.testName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Patient: {result.patient.name} |{" "}
                            {result.labResult.resultDate
                              ? new Date(
                                  result.labResult.resultDate
                                ).toLocaleDateString()
                              : "Pending"}
                          </p>
                        </div>
                        <Badge variant="destructive">Abnormal</Badge>
                      </div>
                      {result.labResult.results && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">
                            Abnormal Values:
                          </p>
                          <div className="space-y-1 mt-1">
                            {Object.entries(
                              JSON.parse(result.labResult.results) as Record<
                                string,
                                LabTestResult
                              >
                            )
                              .filter(
                                ([, value]: [string, LabTestResult]) =>
                                  value.status !== "normal"
                              )
                              .map(([key, value]: [string, LabTestResult]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-gray-600">{key}:</span>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={getResultStatusColor(
                                        value.status
                                      )}
                                    >
                                      {value.value} {value.unit}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      (Normal: {value.normalRange})
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {result.labResult.interpretation && (
                        <p className="text-sm text-gray-700 mt-2 font-medium">
                          {result.labResult.interpretation}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Results</CardTitle>
              <CardDescription>
                Lab results that have been reviewed and signed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead>Result Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewed.map((result) => (
                      <TableRow key={result.labResult.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {result.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {result.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {result.patient.age
                                  ? `${result.patient.age} years`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {result.labResult.testName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {result.labResult.testCategory}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(
                            result.labResult.testDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {result.labResult.resultDate
                            ? new Date(
                                result.labResult.resultDate
                              ).toLocaleDateString()
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(result.labResult.status)}
                          >
                            Reviewed
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.labResult.reviewedAt
                            ? new Date(
                                result.labResult.reviewedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
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

        <TabsContent value="critical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Critical Values</CardTitle>
              <CardDescription>
                Lab results with critical values requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {criticalResults.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    No Critical Values
                  </p>
                  <p className="text-gray-500">
                    All current lab results are within acceptable ranges.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {criticalResults.map((result) => (
                    <div
                      key={result.labResult.id}
                      className="flex items-center space-x-4 p-4 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-red-800">
                          {result.labResult.testName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Patient: {result.patient.name} | Urgent attention
                          required
                        </p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Review Immediately
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Lab Results</CardTitle>
              <CardDescription>
                Complete history of laboratory test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search results by patient name, test name, or date..."
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_review">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Test Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="blood-work">Blood Work</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="microbiology">Microbiology</SelectItem>
                    <SelectItem value="pathology">Pathology</SelectItem>
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
                      <TableHead>Test Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead>Result Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabResults.map((result) => (
                      <TableRow key={result.labResult.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {result.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {result.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {result.patient.age
                                  ? `${result.patient.age} years`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {result.labResult.testName}
                          </p>
                        </TableCell>
                        <TableCell>{result.labResult.testCategory}</TableCell>
                        <TableCell>
                          {new Date(
                            result.labResult.testDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {result.labResult.resultDate
                            ? new Date(
                                result.labResult.resultDate
                              ).toLocaleDateString()
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(result.labResult.status)}
                          >
                            {result.labResult.status === "pending_review"
                              ? "Pending"
                              : result.labResult.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">Normal</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {result.labResult.status === "pending_review" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleReviewResult(
                                    result.labResult.id,
                                    "",
                                    ""
                                  )
                                }
                                disabled={
                                  reviewingResultId === result.labResult.id
                                }
                              >
                                {reviewingResultId === result.labResult.id ? (
                                  <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                ) : null}
                                Review
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
    </div>
  );
};

export default DoctorLabResultsPage;
