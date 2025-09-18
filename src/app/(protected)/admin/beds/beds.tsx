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
  Bed,
  BedDouble,
  CheckCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { BedSpacesTable } from "@/components/admin/beds/bed-spaces-table";
import { BedSpaceForm } from "@/components/admin/beds/bed-space-form";
import {
  getBedSpaces,
  getBedOccupancyStats,
  getDepartments,
  getWards,
} from "@/actions/bed-actions";
import { bedStatuses, bedTypes } from "@/db/schema";
import { toast } from "sonner";

interface BedSpace {
  id: number;
  roomNumber: string;
  bedNumber: string;
  departmentId?: number | null;
  departmentName?: string | null;
  ward?: string | null;
  floor?: number | null;
  type: (typeof bedTypes)[number];
  status: (typeof bedStatuses)[number];
  description?: string | null;
  equipment?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  total?: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BedsPage() {
  const [bedSpaces, setBedSpaces] = useState<BedSpace[]>([]);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [wards, setWards] = useState<string[]>([]);
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [stats, setStats] = useState({
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    maintenanceBeds: 0,
    reservedBeds: 0,
    totalPatients: 0,
    currentAdmissions: 0,
  });

  const loadBedSpaces = useCallback(
    async (
      page = currentPage,
      search = searchTerm,
      departmentId = selectedDepartment
        ? parseInt(selectedDepartment)
        : undefined,
      type = selectedType,
      status = selectedStatus,
      ward = selectedWard
    ) => {
      setIsLoading(true);
      try {
        const result = await getBedSpaces(
          page,
          pageSize,
          search,
          departmentId,
          type,
          status,
          ward
        );
        if (result.success) {
          setBedSpaces(result.beds || []);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          toast.error(result.error || "Failed to load bed spaces");
        }
      } catch {
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentPage,
      pageSize,
      searchTerm,
      selectedDepartment,
      selectedType,
      selectedStatus,
      selectedWard,
    ]
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

  const loadFilters = useCallback(async () => {
    try {
      const [deptResult, wardResult] = await Promise.all([
        getDepartments(),
        getWards(),
      ]);

      if (deptResult.success) {
        setDepartments(deptResult.departments || []);
      }

      if (wardResult.success) {
        setWards(
          (wardResult.wards || []).filter(
            (ward): ward is string => ward !== null
          )
        );
      }
    } catch {
      // Silently fail for filters
    }
  }, []);

  useEffect(() => {
    loadBedSpaces();
    loadStats();
    loadFilters();
  }, [loadBedSpaces, loadStats, loadFilters]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadBedSpaces(1, searchTerm);
  };

  const handleRefresh = () => {
    loadBedSpaces();
    loadStats();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadBedSpaces();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedWard("");
    setCurrentPage(1);
    loadBedSpaces(1, "");
  };

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bed Space Management</h1>
          <p className="text-muted-foreground">
            Manage hospital bed spaces and occupancy information
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bed Space
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBeds}</div>
            <p className="text-xs text-muted-foreground">All bed spaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Beds
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
            <BedDouble className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.occupiedBeds}
            </div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Patients
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.currentAdmissions}
            </div>
            <p className="text-xs text-muted-foreground">Active admissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bed Spaces</CardTitle>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by room/bed number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Search
              </Button>

              <Select
                value={selectedDepartment}
                onValueChange={(value) => {
                  setSelectedDepartment(value === "all" ? "" : value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value === "all" ? "" : value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {bedTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value === "all" ? "" : value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {bedStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedWard}
                onValueChange={(value) => {
                  setSelectedWard(value === "all" ? "" : value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward} value={ward}>
                      {ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
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
              <span className="ml-2">Loading bed spaces...</span>
            </div>
          ) : (
            <>
              <BedSpacesTable bedSpaces={bedSpaces} onRefresh={handleRefresh} />

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} bed spaces
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

      <BedSpaceForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
