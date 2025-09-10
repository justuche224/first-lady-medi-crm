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
  UserCheck,
  Users,
  Star,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { DoctorsTable } from "@/components/admin/doctors/doctors-table";
import { DoctorForm } from "@/components/admin/doctors/doctor-form";
import { getDoctors } from "@/actions/doctor-actions";
import { toast } from "sonner";

interface Doctor {
  id: number;
  userId: string;
  name: string;
  email: string;
  banned: boolean | null;
  createdAt: Date;
  licenseNumber: string;
  specialty: string;
  departmentId?: number | null;
  departmentName?: string | null;
  yearsOfExperience?: number | null;
  education?: string | null;
  certifications?: string | null;
  consultationFee?: string | null;
  rating?: string | null;
  totalPatients?: number | null;
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

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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

  const loadDoctors = useCallback(
    async (page = currentPage, search = searchTerm) => {
      setIsLoading(true);
      try {
        const result = await getDoctors(page, pageSize, search);
        if (result.success) {
          setDoctors(result.doctors || []);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          toast.error(result.error || "Failed to load doctors");
        }
      } catch {
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, searchTerm]
  );

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadDoctors(1, searchTerm);
  };

  const handleRefresh = () => {
    loadDoctors();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  const getStats = () => {
    const activeDoctors = doctors.filter((d) => !d.banned).length;
    const bannedDoctors = doctors.filter((d) => d.banned).length;
    const averageRating =
      doctors.reduce((acc, d) => {
        const rating = parseFloat(d.rating || "0");
        return acc + rating;
      }, 0) / (doctors.length || 1);

    return {
      total: pagination.total,
      active: activeDoctors,
      banned: bannedDoctors,
      averageRating: averageRating.toFixed(1),
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Management</h1>
          <p className="text-muted-foreground">
            Manage medical professionals and their credentials
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered doctors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Doctors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently practicing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.banned}
            </div>
            <p className="text-xs text-muted-foreground">Suspended accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.averageRating}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Search
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
              <span className="ml-2">Loading doctors...</span>
            </div>
          ) : (
            <>
              <DoctorsTable doctors={doctors} onRefresh={handleRefresh} />

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} doctors
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

      <DoctorForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
