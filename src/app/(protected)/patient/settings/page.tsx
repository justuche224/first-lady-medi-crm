import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  User,
  Bell,
  Shield,
  Lock,
  Smartphone,
  Mail,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = async () => {
  const user = await serverAuth();
  if (!user || user.role !== "patient") {
    redirect("/");
  }

  // Mock settings data - in a real app, these would come from the database
  const mockSettings = {
    notifications: {
      email: true,
      sms: false,
      push: true,
      appointment: true,
      medication: true,
      results: true,
      messages: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      shareData: false,
      analyticsOptOut: false,
      twoFactorAuth: false,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      soundEnabled: true,
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-slate-100 mt-1">
                Manage your account preferences and privacy settings
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    defaultValue="1990-01-15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select defaultValue="male">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  defaultValue="123 Main St, Anytown, ST 12345"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">
                    Emergency Contact Name
                  </Label>
                  <Input id="emergencyContact" defaultValue="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    defaultValue="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>
                Update your medical details for better care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select defaultValue="o-positive">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a-positive">A+</SelectItem>
                      <SelectItem value="a-negative">A-</SelectItem>
                      <SelectItem value="b-positive">B+</SelectItem>
                      <SelectItem value="b-negative">B-</SelectItem>
                      <SelectItem value="ab-positive">AB+</SelectItem>
                      <SelectItem value="ab-negative">AB-</SelectItem>
                      <SelectItem value="o-positive">O+</SelectItem>
                      <SelectItem value="o-negative">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    defaultValue="Blue Cross Blue Shield"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceNumber">
                    Insurance Policy Number
                  </Label>
                  <Input id="insuranceNumber" defaultValue="BCBS123456789" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any allergies you have..."
                  defaultValue="Penicillin, Shellfish"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Briefly describe your medical history..."
                  defaultValue="Hypertension diagnosed in 2018, managed with medication."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      defaultChecked={mockSettings.notifications.email}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="sms-notifications">
                        SMS Notifications
                      </Label>
                    </div>
                    <Switch
                      id="sms-notifications"
                      defaultChecked={mockSettings.notifications.sms}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="push-notifications">
                        Push Notifications
                      </Label>
                    </div>
                    <Switch
                      id="push-notifications"
                      defaultChecked={mockSettings.notifications.push}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointment-notifications">
                        Appointment Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get notified about upcoming appointments
                      </p>
                    </div>
                    <Switch
                      id="appointment-notifications"
                      defaultChecked={mockSettings.notifications.appointment}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="medication-notifications">
                        Medication Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Reminders to take medications and refills
                      </p>
                    </div>
                    <Switch
                      id="medication-notifications"
                      defaultChecked={mockSettings.notifications.medication}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="results-notifications">Lab Results</Label>
                      <p className="text-sm text-gray-500">
                        Get notified when lab results are available
                      </p>
                    </div>
                    <Switch
                      id="results-notifications"
                      defaultChecked={mockSettings.notifications.results}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="messages-notifications">
                        New Messages
                      </Label>
                      <p className="text-sm text-gray-500">
                        Notifications for messages from healthcare providers
                      </p>
                    </div>
                    <Switch
                      id="messages-notifications"
                      defaultChecked={mockSettings.notifications.messages}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing-notifications">
                        Marketing & Updates
                      </Label>
                      <p className="text-sm text-gray-500">
                        Health tips and service updates
                      </p>
                    </div>
                    <Switch
                      id="marketing-notifications"
                      defaultChecked={mockSettings.notifications.marketing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>
                Control your privacy settings and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-visible">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">
                      Allow other patients to see your profile information
                    </p>
                  </div>
                  <Switch
                    id="profile-visible"
                    defaultChecked={mockSettings.privacy.profileVisible}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-data">
                      Data Sharing for Research
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow anonymized data to be used for medical research
                    </p>
                  </div>
                  <Switch
                    id="share-data"
                    defaultChecked={mockSettings.privacy.shareData}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics-opt-out">Analytics Opt-out</Label>
                    <p className="text-sm text-gray-500">
                      Opt out of usage analytics and tracking
                    </p>
                  </div>
                  <Switch
                    id="analytics-opt-out"
                    defaultChecked={mockSettings.privacy.analyticsOptOut}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {mockSettings.privacy.twoFactorAuth ? (
                        <Badge className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        {mockSettings.privacy.twoFactorAuth
                          ? "Disable"
                          : "Enable"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Password</Label>
                      <p className="text-sm text-gray-500">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Display & Interface</span>
              </CardTitle>
              <CardDescription>
                Customize your experience with theme and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue={mockSettings.preferences.theme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue={mockSettings.preferences.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={mockSettings.preferences.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue={mockSettings.preferences.dateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {mockSettings.preferences.soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-gray-500" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-500" />
                    )}
                    <Label htmlFor="sound-enabled">Sound Effects</Label>
                  </div>
                  <Switch
                    id="sound-enabled"
                    defaultChecked={mockSettings.preferences.soundEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Management */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Management</span>
              </CardTitle>
              <CardDescription>
                Manage your account data and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-sm text-gray-500">
                      Your account is active and verified
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Member Since</Label>
                    <p className="text-sm text-gray-500">January 15, 2023</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Download Your Data</Label>
                      <p className="text-sm text-gray-500">
                        Get a copy of all your medical data
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="space-y-3 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-red-800">Delete Account</Label>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span>Are you absolutely sure?</span>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove all your medical data
                            from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default SettingsPage;
