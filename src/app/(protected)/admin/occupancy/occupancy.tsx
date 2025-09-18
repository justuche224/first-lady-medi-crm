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
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { OccupancyTable } from "@/components/admin/occupancy/occupancy-table";
import { PatientAllocationForm } from "@/components/admin/occupancy/patient-allocation-form";
import {
  getBedOccupancyHistory,
  getBedOccupancyStats,
  getAvailableBeds,
} from "@/actions/bed-actions";
import { toast } from "sonner";

interface OccupancyRecord {
  id: number;
  bedId: number;
  roomNumber: string;
  bedNumber: string;
  patientId: number;
  patientName: string;
  doctorId?: number;
  doctorName?: string;
  admissionDate: Date;
  actualDischargeDate?: Date;
  admissionReason: string;
  diagnosis?: string;
  status: string;
  total?: number;
}

interface AvailableBed {
  id: number;
  roomNumber: string;
  bedNumber: string;
  departmentId?: number | null;
  departmentName?: string | null;
  ward?: string | null;
  floor?: number | null;
  type: string;
  description?: string | null;
  equipment?: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function OccupancyPage() {
  const [occupancyRecords, setOccupancyRecords] = useState<OccupancyRecord[]>(
    []
  );
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [stats, setStats] = useState({
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    maintenanceBeds: 0,
    reservedBeds: 0,
    totalPatients: 0,
    currentAdmissions: 0,
  });
  const [availableBeds, setAvailableBeds] = useState<AvailableBed[]>([]);

  const loadOccupancyRecords = useCallback(
    async (
      page = currentPage,
      search = searchTerm,
      status = selectedStatus
    ) => {
      setIsLoading(true);
      console.log(page, search, status);
      try {
        const result = await getBedOccupancyHistory(
          undefined,
          undefined,
          page,
          pageSize
        );
        if (result.success) {
          // @ts-expect-error - result.occupancy is not typed
          setOccupancyRecords(result.occupancy || []);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          toast.error(result.error || "Failed to load occupancy records");
        }
      } catch {
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, searchTerm, selectedStatus]
  );

  const loadStats = useCallback(async () => {
    try {
      const result = await getBedOccupancyStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch {
      // Silently fail for stats
    }
  }, []);

  const loadAvailableBeds = useCallback(async () => {
    try {
      const result = await getAvailableBeds();
      if (result.success) {
        setAvailableBeds(result.beds || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    loadOccupancyRecords();
    loadStats();
    loadAvailableBeds();
  }, [loadOccupancyRecords, loadStats, loadAvailableBeds]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadOccupancyRecords(1, searchTerm);
  };

  const handleRefresh = () => {
    loadOccupancyRecords();
    loadStats();
    loadAvailableBeds();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    loadOccupancyRecords(1, searchTerm, status);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setCurrentPage(1);
    loadOccupancyRecords(1, "");
  };

  const dischargedRecords = occupancyRecords.filter(
    (record) => record.status === "discharged"
  );

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bed Occupancy Management</h1>
          <p className="text-muted-foreground">
            Manage patient admissions, discharges, and bed allocations
          </p>
        </div>
        <Button onClick={() => setShowAllocationForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Allocate Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Patients
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.currentAdmissions}
            </div>
            <p className="text-xs text-muted-foreground">Currently admitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Beds
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.availableBeds}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discharged
            </CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dischargedRecords.length}
            </div>
            <p className="text-xs text-muted-foreground">This page view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalBeds > 0
                ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Bed utilization</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy Records</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or bed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>

            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                handleStatusFilterChange(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading occupancy records...</span>
            </div>
          ) : (
            <>
              <OccupancyTable
                records={occupancyRecords}
                onRefresh={handleRefresh}
              />

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} occupancy records
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <PatientAllocationForm
        open={showAllocationForm}
        onOpenChange={setShowAllocationForm}
        onSuccess={handleRefresh}
        // @ts-expect-error - availableBeds is not typed
        availableBeds={availableBeds}
      />
    </div>
  );
}
