import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  User,
  Award,
  Clock,
  DollarSign,
  Star,
  Users,
  Edit,
  Save,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getCurrentDoctorProfile } from "@/actions";

const DoctorProfilePage = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "doctor") {
    redirect("/dashboard");
  }

  // Fetch live doctor profile data
  const profileResult = await getCurrentDoctorProfile();

  if (!profileResult.success) {
    console.error("Error loading doctor profile:", profileResult.error);
    redirect("/dashboard");
  }

  const profile = profileResult.profile;
  if (!profile) {
    redirect("/dashboard");
  }

  const doctorData = profile.doctor;
  const userData = profile.user;
  const departmentData = profile.department;

  if (!doctorData || !userData) {
    redirect("/dashboard");
  }

  // Parse availability from JSON string if available
  let availability;
  try {
    availability = doctorData.availability
      ? JSON.parse(doctorData.availability)
      : {
          monday: { enabled: true, start: "09:00", end: "17:00" },
          tuesday: { enabled: true, start: "09:00", end: "17:00" },
          wednesday: { enabled: true, start: "09:00", end: "17:00" },
          thursday: { enabled: true, start: "09:00", end: "17:00" },
          friday: { enabled: true, start: "09:00", end: "17:00" },
          saturday: { enabled: false, start: "", end: "" },
          sunday: { enabled: false, start: "", end: "" },
        };
  } catch (error) {
    console.error("Error parsing availability:", error);
    availability = {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: false, start: "", end: "" },
      sunday: { enabled: false, start: "", end: "" },
    };
  }

  const doctorProfile = {
    id: doctorData.id,
    userId: userData.id,
    name: userData.name || "Dr. Unknown",
    email: userData.email,
    image: user.image,
    licenseNumber: doctorData.licenseNumber,
    specialty: doctorData.specialty,
    department: departmentData?.name || "No Department",
    yearsOfExperience: doctorData.yearsOfExperience || 0,
    education: doctorData.education || "No education information available",
    certifications: doctorData.certifications || "No certifications listed",
    phone: "Not provided", // Phone is not in the current schema
    address: "Not provided", // Address is not in the current schema
    consultationFee: doctorData.consultationFee
      ? parseFloat(doctorData.consultationFee)
      : 0,
    rating: doctorData.rating ? parseFloat(doctorData.rating) : 0,
    totalPatients: doctorData.totalPatients || 0,
    availability,
    bio: `Dr. ${userData.name} is a ${doctorData.specialty} specialist with ${
      doctorData.yearsOfExperience
    } years of experience. ${
      doctorData.education ? `Education: ${doctorData.education}.` : ""
    } ${
      doctorData.certifications
        ? `Certifications: ${doctorData.certifications}.`
        : ""
    }`,
  };

  // Mock achievements for now - could be extended to database later
  const achievements = [
    {
      title: "Medical Excellence",
      year: "2023",
      description: `${doctorData.yearsOfExperience} years of dedicated service`,
    },
    {
      title: "Patient Care",
      year: "2022",
      description: `Serving ${doctorData.totalPatients} patients with ${doctorData.rating}/5 rating`,
    },
    {
      title: "Professional Development",
      year: "2021",
      description:
        doctorData.certifications || "Continuous professional development",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 container mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl text-white">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage
              src={doctorProfile.image || ""}
              alt={doctorProfile.name}
            />
            <AvatarFallback className="text-2xl bg-blue-500">
              {doctorProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{doctorProfile.name}</h1>
            <p className="text-blue-100 text-lg">{doctorProfile.specialty}</p>
            <p className="text-blue-200">{doctorProfile.department}</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-semibold">{doctorProfile.rating}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-1" />
                <span>{doctorProfile.totalPatients} Patients</span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-1" />
                <span>{doctorProfile.yearsOfExperience} Years Experience</span>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="lg">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="professional">Professional Info</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={doctorProfile.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={doctorProfile.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={doctorProfile.phone} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={doctorProfile.address} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-blue-600 mb-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">
                        Consultation Fee
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      ${doctorProfile.consultationFee}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center text-green-600 mb-1">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {doctorProfile.rating}/5.0
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={doctorProfile.bio} readOnly rows={4} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Weekly Availability
              </CardTitle>
              <CardDescription>
                Set your availability for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(doctorProfile.availability).map(
                ([day, schedule]) => {
                  const scheduleData = schedule as {
                    enabled: boolean;
                    start: string;
                    end: string;
                  };
                  return (
                    <div
                      key={day}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="w-24">
                        <Label className="capitalize font-medium">{day}</Label>
                      </div>
                      <Switch checked={scheduleData.enabled} />
                      <div className="flex items-center space-x-2 flex-1">
                        {scheduleData.enabled && (
                          <>
                            <Input
                              type="time"
                              value={scheduleData.start}
                              className="w-32"
                              disabled={!scheduleData.enabled}
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              value={scheduleData.end}
                              className="w-32"
                              disabled={!scheduleData.enabled}
                            />
                          </>
                        )}
                        {!scheduleData.enabled && (
                          <span className="text-gray-500">Not available</span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
              <div className="flex justify-end pt-4">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input value={doctorProfile.licenseNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input value={doctorProfile.specialty} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={doctorProfile.department} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input value={doctorProfile.yearsOfExperience} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education & Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Education</Label>
                  <Textarea value={doctorProfile.education} readOnly rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <Textarea
                    value={doctorProfile.certifications}
                    readOnly
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Awards & Achievements
              </CardTitle>
              <CardDescription>
                Recognition and accomplishments throughout your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge variant="outline">{achievement.year}</Badge>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {achievement.description}
                      </p>
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

export default DoctorProfilePage;
