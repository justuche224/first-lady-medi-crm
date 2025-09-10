import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user as users, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Shield,
  FileText,
  AlertTriangle,
  Edit,
} from "lucide-react";

const ProfilePage = async () => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  // Get patient profile data
  const patientData = await db
    .select({
      user: users,
      patient: patients,
    })
    .from(users)
    .leftJoin(patients, eq(users.id, patients.userId))
    .where(eq(users.id, user.id))
    .limit(1);

  if (!patientData[0]) {
    redirect("/");
  }

  const { user: userData, patient: patientInfo } = patientData[0];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return "Not provided";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return `${age} years old`;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-blue-100 mt-1">
                Manage your personal information and medical details
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Your basic personal and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-lg font-medium">{userData.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-lg">{userData.email}</p>
                  {userData.emailVerified && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-lg">
                    {patientInfo?.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Date of Birth
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-lg">
                    {formatDate(patientInfo?.dateOfBirth || null)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-lg">
                  {calculateAge(patientInfo?.dateOfBirth || null)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Gender
                </label>
                <p className="text-lg capitalize">
                  {patientInfo?.gender || "Not provided"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Address
              </label>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <p className="text-lg">
                  {patientInfo?.address || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Health Summary</span>
            </CardTitle>
            <CardDescription>
              Key health indicators and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {patientInfo?.healthScore || 0}%
              </div>
              <p className="text-sm text-green-700 mt-1">Health Score</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Blood Type</span>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  {patientInfo?.bloodType || "Unknown"}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-sm font-medium">Allergies</span>
                {patientInfo?.allergies ? (
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {patientInfo.allergies}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No known allergies</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span>Emergency Contact</span>
            </CardTitle>
            <CardDescription>Emergency contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Contact Name
              </label>
              <p className="text-lg">
                {patientInfo?.emergencyContact || "Not provided"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Phone Number
              </label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-lg">
                  {patientInfo?.emergencyPhone || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Insurance Information</span>
            </CardTitle>
            <CardDescription>Health insurance details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Insurance Provider
              </label>
              <p className="text-lg">
                {patientInfo?.insuranceProvider || "Not provided"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Policy Number
              </label>
              <p className="text-lg font-mono">
                {patientInfo?.insuranceNumber || "Not provided"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medical History Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span>Medical History Summary</span>
            </CardTitle>
            <CardDescription>
              Brief overview of your medical history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patientInfo?.medicalHistory ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {patientInfo.medicalHistory}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No medical history recorded
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Account status and registration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Account Status
              </label>
              <div className="flex items-center space-x-2">
                {userData.banned ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Member Since
              </label>
              <p className="text-lg">
                {formatDate(userData.createdAt.toISOString())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
