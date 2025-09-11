"use client";

import React, { useState, useEffect } from "react";
import {
  TestTube,
  Plus,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
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
import { getLabResults } from "@/actions/lab-actions";
import { getDoctorPatients } from "@/actions/doctor-dashboard-actions";
import { LabOrderForm } from "@/components/doctor/lab-order-form";

interface LabOrderData {
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

const DoctorLabOrdersPage = () => {
  const [labOrders, setLabOrders] = useState<LabOrderData[]>([]);
  const [patients, setPatients] = useState<
    Array<{
      id: number;
      name: string;
      age?: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form states
  const [showLabOrderForm, setShowLabOrderForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load lab orders (all for this doctor)
      const ordersResult = await getLabResults();
      if (ordersResult.success) {
        setLabOrders(
          (ordersResult.labResults || []) as unknown as LabOrderData[]
        );
      } else {
        setError(ordersResult.error || "Failed to load lab orders");
      }

      // Load patients for lab order form
      const patientsResult = await getDoctorPatients();
      if (patientsResult.success) {
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
          .filter((p) => p.id && p.name);
        setPatients(transformedPatients);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter lab orders based on search and filters
  const filteredLabOrders = labOrders.filter((order) => {
    const matchesSearch =
      order.labResult.testName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.labResult.testCategory
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.labResult.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      order.labResult.testCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Categorize orders
  const pendingOrders = filteredLabOrders.filter(
    (order) => order.labResult.status === "pending"
  );
  const collectedOrders = filteredLabOrders.filter(
    (order) => order.labResult.status === "collected"
  );
  const resultedOrders = filteredLabOrders.filter(
    (order) =>
      order.labResult.status === "completed" ||
      order.labResult.status === "reviewed"
  );
  const urgentOrders = filteredLabOrders.filter(
    (order) => order.labResult.status === "urgent"
  );

  const stats = {
    totalOrders: filteredLabOrders.length,
    pendingOrders: pendingOrders.length,
    collectedOrders: collectedOrders.length,
    resultedOrders: resultedOrders.length,
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
            <span>Loading lab orders...</span>
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
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Lab Orders
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
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "collected":
        return "bg-blue-100 text-blue-800";
      case "completed":
      case "reviewed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "collected":
        return <TestTube className="h-4 w-4 text-blue-600" />;
      case "completed":
      case "reviewed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <TestTube className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lab Orders</h1>
              <p className="text-teal-100 mt-1">
                Order and track laboratory tests for patients
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowLabOrderForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Lab Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
                <p className="text-sm text-gray-600">Pending Collection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.collectedOrders}
                </p>
                <p className="text-sm text-gray-600">Collected</p>
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
                  {stats.resultedOrders}
                </p>
                <p className="text-sm text-gray-600">Results Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="collected">Collected</TabsTrigger>
          <TabsTrigger value="resulted">Results Available</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Lab Orders</CardTitle>
              <CardDescription>
                Orders awaiting patient collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.labResult.id}
                    className="flex items-center space-x-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                  >
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {order.labResult.testName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {order.labResult.testCategory}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getStatusColor(order.labResult.status)}
                          >
                            {order.labResult.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-500">
                          Patient: {order.patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ordered:{" "}
                          {new Date(
                            order.labResult.testDate
                          ).toLocaleDateString()}
                        </p>
                        {order.labResult.resultDate && (
                          <p className="text-sm text-gray-500">
                            Expected:{" "}
                            {new Date(
                              order.labResult.resultDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {order.labResult.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          Notes: {order.labResult.notes}
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

        <TabsContent value="collected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collected Samples</CardTitle>
              <CardDescription>
                Samples collected and being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectedOrders.map((order) => (
                  <div
                    key={order.labResult.id}
                    className="flex items-center space-x-4 p-4 border border-blue-200 bg-blue-50 rounded-lg"
                  >
                    <div className="bg-blue-100 p-2 rounded-full">
                      <TestTube className="h-5 w-5 text-blue-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {order.labResult.testName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {order.labResult.testCategory}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(order.labResult.status)}
                        >
                          {order.labResult.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {order.patient.name} | Test Date:{" "}
                        {new Date(
                          order.labResult.testDate
                        ).toLocaleDateString()}
                      </p>
                      {order.labResult.resultDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Expected results:{" "}
                          {new Date(
                            order.labResult.resultDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Track Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resulted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Results Available</CardTitle>
              <CardDescription>Lab results ready for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resultedOrders.map((order) => (
                  <div
                    key={order.labResult.id}
                    className="flex items-center space-x-4 p-4 border border-green-200 bg-green-50 rounded-lg"
                  >
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {order.labResult.testName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {order.labResult.testCategory}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(order.labResult.status)}
                        >
                          {order.labResult.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {order.patient.name} | Test Date:{" "}
                        {new Date(
                          order.labResult.testDate
                        ).toLocaleDateString()}
                      </p>
                      {order.labResult.resultDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Results:{" "}
                          {new Date(
                            order.labResult.resultDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" asChild>
                        <Link href="/doctor/lab-results">View Results</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Lab Orders</CardTitle>
              <CardDescription>
                High priority and STAT laboratory orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urgentOrders.map((order) => (
                  <div
                    key={order.labResult.id}
                    className="flex items-center space-x-4 p-4 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <Avatar>
                      <AvatarFallback>
                        {order.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {order.labResult.testName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {order.labResult.testCategory}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getStatusColor(order.labResult.status)}
                          >
                            {order.labResult.status}
                          </Badge>
                          <Badge variant="destructive">URGENT</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {order.patient.name} | Test Date:{" "}
                        {new Date(
                          order.labResult.testDate
                        ).toLocaleDateString()}
                      </p>
                      {order.labResult.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          Notes: {order.labResult.notes}
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

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Lab Orders</CardTitle>
              <CardDescription>
                Complete history of laboratory orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by patient name, test name, or order ID..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="collected">Collected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Test Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Blood Work">Blood Work</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Microbiology">Microbiology</SelectItem>
                    <SelectItem value="Pathology">Pathology</SelectItem>
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
                      <TableHead>Order Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Expected Results</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabOrders.map((order) => (
                      <TableRow key={order.labResult.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {order.patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {order.patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.patient.age
                                  ? `${order.patient.age} years`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {order.labResult.testName}
                          </p>
                        </TableCell>
                        <TableCell>{order.labResult.testCategory}</TableCell>
                        <TableCell>
                          {new Date(
                            order.labResult.testDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.labResult.status)}
                            <Badge
                              className={getStatusColor(order.labResult.status)}
                            >
                              {order.labResult.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">Normal</span>
                        </TableCell>
                        <TableCell>
                          {order.labResult.resultDate
                            ? new Date(
                                order.labResult.resultDate
                              ).toLocaleDateString()
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {(order.labResult.status === "completed" ||
                              order.labResult.status === "reviewed") && (
                              <Button size="sm" asChild>
                                <Link href="/doctor/lab-results">Results</Link>
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

      {/* Lab Order Form Modal */}
      <LabOrderForm
        open={showLabOrderForm}
        onOpenChange={setShowLabOrderForm}
        patients={patients}
        onSuccess={() => {
          loadData();
          setShowLabOrderForm(false);
        }}
      />
    </div>
  );
};

export default DoctorLabOrdersPage;
