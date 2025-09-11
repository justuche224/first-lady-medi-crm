import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  Plus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DoctorReportsPage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-emerald-100 mt-1">
                Generate reports and view analytics
              </p>
            </div>
          </div>
          <Button variant="secondary" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">156</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">89</p>
                <p className="text-sm text-gray-600">Appointments This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">94.8%</p>
                <p className="text-sm text-gray-600">Patient Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">12</p>
                <p className="text-sm text-gray-600">Reports Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patient-reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient-reports">Patient Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-reports">
          <Card>
            <CardHeader>
              <CardTitle>Patient Reports</CardTitle>
              <CardDescription>
                Generate comprehensive patient reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Individual Patient Report
                    </CardTitle>
                    <CardDescription>
                      Complete medical history and treatment summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Generate Patient Report</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Treatment Outcomes
                    </CardTitle>
                    <CardDescription>
                      Analysis of treatment effectiveness
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Generate Outcomes Report</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Medication Adherence
                    </CardTitle>
                    <CardDescription>
                      Patient medication compliance analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      Generate Adherence Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Appointment Summary
                    </CardTitle>
                    <CardDescription>
                      Summary of patient visits and consultations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Generate Summary Report</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Analytics</CardTitle>
                <CardDescription>
                  Key performance indicators and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-gray-600">
                      Appointment Completion Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      12 min
                    </div>
                    <div className="text-sm text-gray-600">
                      Average Wait Time
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      4.8/5
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
                <CardDescription>
                  Overview of patient population
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Age 18-35</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                      </div>
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Age 36-55</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-2/5"></div>
                      </div>
                      <span className="text-sm">42%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Age 55+</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full w-1/4"></div>
                      </div>
                      <span className="text-sm">23%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generated">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Previously generated reports and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Monthly Patient Summary",
                    date: "2024-01-15",
                    type: "Patient Report",
                    status: "completed",
                  },
                  {
                    title: "Treatment Outcomes Q4 2023",
                    date: "2024-01-10",
                    type: "Analytics",
                    status: "completed",
                  },
                  {
                    title: "Medication Adherence Report",
                    date: "2024-01-05",
                    type: "Medication",
                    status: "completed",
                  },
                  {
                    title: "Department Performance",
                    date: "2024-01-01",
                    type: "Analytics",
                    status: "completed",
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <p className="text-sm text-gray-600">
                          Generated on {report.date} | {report.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{report.status}</Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorReportsPage;
