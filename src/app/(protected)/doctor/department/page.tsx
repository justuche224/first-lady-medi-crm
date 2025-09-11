import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  Building2,
  Users,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DoctorDepartmentPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  // Mock department data
  const department = {
    id: 1,
    name: "Cardiology Department",
    description: "Comprehensive cardiovascular care and treatment services",
    headDoctor: "Dr. Sarah Wilson",
    location: "Building A, Floor 3",
    phone: "+1 (555) 123-4567",
    email: "cardiology@hospital.com",
    totalDoctors: 8,
    totalPatients: 456,
    totalStaff: 15,
    avgRating: 4.7,
  };

  const colleagues = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      role: "Department Head",
      specialty: "Interventional Cardiology",
      experience: 15,
      image: null,
      status: "available",
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      role: "Senior Cardiologist",
      specialty: "Electrophysiology",
      experience: 12,
      image: null,
      status: "busy",
    },
    {
      id: 3,
      name: "Dr. Lisa Chen",
      role: "Cardiologist",
      specialty: "Pediatric Cardiology",
      experience: 8,
      image: null,
      status: "available",
    },
    {
      id: 4,
      name: "Dr. Robert Taylor",
      role: "Cardiologist",
      specialty: "Heart Failure",
      experience: 10,
      image: null,
      status: "off-duty",
    },
  ];

  const departmentStats = {
    monthlyAppointments: 1245,
    patientSatisfaction: 94.2,
    avgWaitTime: 15,
    completionRate: 89,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "off-duty":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 p-6 rounded-xl text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <p className="text-cyan-100 mt-1">{department.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">
                  {department.totalDoctors}
                </p>
                <p className="text-sm text-gray-600">Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {department.totalPatients}
                </p>
                <p className="text-sm text-gray-600">Patients Served</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">
                  {departmentStats.monthlyAppointments}
                </p>
                <p className="text-sm text-gray-600">Monthly Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {department.avgRating}
                </p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="colleagues">Colleagues</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Information</CardTitle>
                <CardDescription>
                  General information about the department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-sm text-gray-600">{department.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Department Head</p>
                    <p className="text-sm text-gray-600">
                      {department.headDoctor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">
                      {department.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Team Size</p>
                    <p className="text-sm text-gray-600">
                      {department.totalStaff} staff members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Patient Satisfaction
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "94%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {departmentStats.patientSatisfaction}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "89%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {departmentStats.completionRate}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Wait Time</span>
                  <span className="text-sm font-medium">
                    {departmentStats.avgWaitTime} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Volume</span>
                  <span className="text-sm font-medium">
                    {departmentStats.monthlyAppointments} appointments
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colleagues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Colleagues</CardTitle>
              <CardDescription>
                Other doctors and staff in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {colleagues.map((colleague) => (
                  <div
                    key={colleague.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={colleague.image || ""} />
                      <AvatarFallback>
                        {colleague.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{colleague.name}</h4>
                        <Badge className={getStatusColor(colleague.status)}>
                          {colleague.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{colleague.role}</p>
                      <p className="text-sm text-gray-500">
                        {colleague.specialty}
                      </p>
                      <p className="text-xs text-gray-500">
                        {colleague.experience} years experience
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>
                  Monthly performance metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">+12%</div>
                    <div className="text-sm text-gray-600">
                      Patient Volume Growth
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      4.7/5
                    </div>
                    <div className="text-sm text-gray-600">Quality Rating</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      98%
                    </div>
                    <div className="text-sm text-gray-600">Staff Retention</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>
                  Key metrics over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Appointments Completed
                      </span>
                      <span className="text-sm font-medium">1,245 (+8%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Patient Satisfaction
                      </span>
                      <span className="text-sm font-medium">94.2% (+2%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "94%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Revenue Target
                      </span>
                      <span className="text-sm font-medium">$125K (92%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Contact Information</CardTitle>
              <CardDescription>How to reach the department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">
                        {department.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">
                        {department.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">
                        {department.location}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Office Hours</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                    <p className="text-red-600 font-medium">Emergency: 24/7</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDepartmentPage;
