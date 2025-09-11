"use client";

import * as React from "react";
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  TestTube,
  MessageSquare,
  Star,
  BarChart3,
  Building2,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/doctor/nav-main";
import { NavProjects } from "@/components/doctor/nav-projects";
import { NavUser } from "@/components/doctor/nav-user";
import { TeamSwitcher } from "@/components/doctor/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Doctor navigation data
const data = {
  user: {
    name: "Dr. John Smith",
    email: "john.smith@hospital.com",
    avatar: "/avatars/doctor.jpg",
  },
  teams: [
    {
      name: "Cardiology Dept",
      logo: Stethoscope,
      plan: "Department",
    },
    {
      name: "Medical Center",
      logo: Building2,
      plan: "Hospital",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/doctor",
      icon: Stethoscope,
      isActive: true,
    },
    {
      title: "Patient Management",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "My Patients",
          url: "/doctor/patients",
        },
        {
          title: "Patient Search",
          url: "/doctor/patients?search=true",
        },
      ],
    },
    {
      title: "Appointments",
      url: "#",
      icon: Calendar,
      isActive: true,
      items: [
        {
          title: "Schedule",
          url: "/doctor/appointments",
        },
        {
          title: "Today's Appointments",
          url: "/doctor/appointments?filter=today",
        },
        {
          title: "Upcoming",
          url: "/doctor/appointments?filter=upcoming",
        },
      ],
    },
    {
      title: "Clinical Documentation",
      url: "#",
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "Medical Records",
          url: "/doctor/medical-records",
        },
        {
          title: "Medications",
          url: "/doctor/medications",
        },
        {
          title: "Lab Orders",
          url: "/doctor/lab-orders",
        },
        {
          title: "Lab Results",
          url: "/doctor/lab-results",
        },
      ],
    },
    {
      title: "Communication",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Messages",
          url: "/doctor/messages",
        },
        {
          title: "Patient Feedback",
          url: "/doctor/feedback",
        },
        {
          title: "Notifications",
          url: "/doctor/notifications",
        },
      ],
    },
    {
      title: "Reports & Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Patient Reports",
          url: "/doctor/reports",
        },
        {
          title: "Department Stats",
          url: "/doctor/department",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/doctor/profile",
        },
        {
          title: "Preferences",
          url: "/doctor/settings",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Recent Patients",
      url: "/doctor/patients?filter=recent",
      icon: Users,
    },
    {
      name: "Urgent Cases",
      url: "/doctor/patients?filter=urgent",
      icon: Star,
    },
    {
      name: "Lab Results",
      url: "/doctor/lab-results?filter=pending",
      icon: TestTube,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
