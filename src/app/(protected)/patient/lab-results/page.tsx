import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getLabResults } from "@/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TestTube,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
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
  category?: string;
  search?: string;
}

const LabResultsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  const page = parseInt((await searchParams).page || "1");
  const status = (await searchParams).status || "all";
  const category = (await searchParams).category || "all";
  const search = (await searchParams).search || "";

  // Get lab results data
  const labResultsResult = await getLabResults(
    undefined, // patientId - will be determined by user role
    page,
    20,
    status === "all"
      ? undefined
      : (status as "pending" | "completed" | "reviewed")
  );

  if (!labResultsResult.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading lab results: {labResultsResult.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    labResults = [],
    pagination = {
      totalPages: 0,
      page: 1,
      limit: 20,
      total: 0,
      hasPrev: false,
      hasNext: false,
    },
  } = labResultsResult;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "reviewed":
        return <Eye className="h-3 w-3" />;
      default:
        return <TestTube className="h-3 w-3" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "blood":
        return <TestTube className="h-4 w-4 text-red-600" />;
      case "urine":
        return <TestTube className="h-4 w-4 text-yellow-600" />;
      case "imaging":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "biopsy":
        return <TestTube className="h-4 w-4 text-purple-600" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-600" />;
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

  const parseJsonField = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  const getResultTrend = (
    result: { value?: string | number } | string | number,
    normalRange: string | null
  ) => {
    if (!result || !normalRange) return null;

    // This is a simplified trend analysis - in a real app you'd have more sophisticated logic
    const value = parseFloat(
      typeof result === "object" && result.value
        ? result.value.toString()
        : result.toString()
    );
    if (isNaN(value)) return null;

    // Parse normal range (assuming format like "10-20" or "<5" or ">100")
    const rangeMatch = normalRange.match(
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/
    );
    const lessThanMatch = normalRange.match(/<\s*(\d+(?:\.\d+)?)/);
    const greaterThanMatch = normalRange.match(/>\s*(\d+(?:\.\d+)?)/);

    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      if (value < min) return "low";
      if (value > max) return "high";
      return "normal";
    } else if (lessThanMatch) {
      const threshold = parseFloat(lessThanMatch[1]);
      return value < threshold ? "normal" : "high";
    } else if (greaterThanMatch) {
      const threshold = parseFloat(greaterThanMatch[1]);
      return value > threshold ? "normal" : "low";
    }

    return null;
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "low":
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case "normal":
        return <Minus className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  // Filter results by status and category for stats
  const pendingResults = labResults.filter(
    (result) => result.labResult.status === "pending"
  );
  const completedResults = labResults.filter(
    (result) => result.labResult.status === "completed"
  );
  const reviewedResults = labResults.filter(
    (result) => result.labResult.status === "reviewed"
  );

  // Group by category
  const resultsByCategory = labResults.reduce((acc, result) => {
    const cat = result.labResult.testCategory;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <TestTube className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lab Results</h1>
              <p className="text-teal-100 mt-1">
                View your laboratory test results and reports
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Alerts for pending results */}
      {pendingResults.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">Pending Results</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You have {pendingResults.length} test result(s) that are still
                  being processed. You&apos;ll be notified when they&apos;re
                  ready.
                </p>
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
                  placeholder="Search lab results..."
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue={status}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={category}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="blood">Blood Tests</SelectItem>
                  <SelectItem value="urine">Urine Tests</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="biopsy">Biopsy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-2xl font-bold text-teal-600">
                  {labResults.length}
                </p>
                <p className="text-sm text-gray-600">Total Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingResults.length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {completedResults.length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {reviewedResults.length}
                </p>
                <p className="text-sm text-gray-600">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(resultsByCategory).length}
                </p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Results List */}
      {labResults.length > 0 ? (
        <div className="space-y-4">
          {labResults.map((item) => {
            const results = parseJsonField(item.labResult.results);

            return (
              <Card
                key={item.labResult.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-full bg-teal-100">
                        {getCategoryIcon(item.labResult.testCategory)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">
                            {item.labResult.testName}
                          </h3>
                          <Badge
                            className={getStatusColor(
                              item.labResult.status || ""
                            )}
                          >
                            {getStatusIcon(item.labResult.status || "")}
                            <span className="ml-1 capitalize">
                              {item.labResult.status}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <TestTube className="h-4 w-4" />
                            <span className="capitalize">
                              {item.labResult.testCategory}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Ordered: {formatDate(item.labResult.testDate)}
                            </span>
                          </div>
                          {item.labResult.resultDate && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Results: {formatDate(item.labResult.resultDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Doctor Info */}
                        {item.doctor && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                            <User className="h-4 w-4" />
                            <span>Ordered by Dr. {item.doctor.name}</span>
                          </div>
                        )}

                        {/* Test Results */}
                        {results && item.labResult.status !== "pending" && (
                          <div className="mb-3 p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-3">
                              Test Results
                            </h4>
                            <div className="space-y-2">
                              {Array.isArray(results) ? (
                                results.map(
                                  (
                                    result:
                                      | {
                                          parameter?: string;
                                          value?: string | number;
                                          unit?: string;
                                        }
                                      | string
                                      | number,
                                    index: number
                                  ) => {
                                    const trend = getResultTrend(
                                      result,
                                      item.labResult.normalRange
                                    );
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium">
                                            {(typeof result === "object" &&
                                              result.parameter) ||
                                              `Test ${index + 1}`}
                                            :
                                          </span>
                                          <span>
                                            {typeof result === "object"
                                              ? result.value || "N/A"
                                              : result}
                                          </span>
                                          {typeof result === "object" &&
                                            result.unit && (
                                              <span className="text-gray-500">
                                                ({result.unit})
                                              </span>
                                            )}
                                          {getTrendIcon(trend)}
                                        </div>
                                        {item.labResult.normalRange && (
                                          <span className="text-sm text-gray-500">
                                            Normal: {item.labResult.normalRange}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }
                                )
                              ) : (
                                <div className="flex items-center justify-between py-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">Result:</span>
                                    <span>{results}</span>
                                  </div>
                                  {item.labResult.normalRange && (
                                    <span className="text-sm text-gray-500">
                                      Normal: {item.labResult.normalRange}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interpretation */}
                        {item.labResult.interpretation && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-1">
                              Interpretation
                            </h4>
                            <p className="text-blue-700 text-sm">
                              {item.labResult.interpretation}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {item.labResult.notes && (
                          <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-800 mb-1">
                              Notes
                            </h4>
                            <p className="text-yellow-700 text-sm">
                              {item.labResult.notes}
                            </p>
                          </div>
                        )}

                        {/* Reviewed By */}
                        {item.labResult.status === "reviewed" &&
                          item.doctor && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Reviewed by Dr. {item.doctor.name}</span>
                              {item.labResult.reviewedAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {formatDate(
                                      item.labResult.reviewedAt.toISOString()
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {item.labResult.status !== "pending" && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
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
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No lab results found
              </h3>
              <p className="text-gray-600 mb-4">
                Your lab results will appear here when tests are ordered and
                completed.
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
            {pagination.total} results
          </p>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    pagination.page - 1
                  }&status=${status}&category=${category}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`?page=${
                    pagination.page + 1
                  }&status=${status}&category=${category}`}
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

export default LabResultsPage;
