"use client";

import * as React from "react";
import {
  BarChart3,
  FileText,
  Hospital,
  Stethoscope,
  Users,
  UserCheck,
  Building2,
} from "lucide-react";

import { NavMain } from "@/components/admin/nav-main";
import { NavProjects } from "@/components/admin/nav-projects";
import { NavUser } from "@/components/admin/nav-user";
import { TeamSwitcher } from "@/components/admin/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Medical CRM Navigation Data
const data = {
  user: {
    name: "Admin User",
    email: "admin@hospital.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "MediCare Hospital",
      logo: Hospital,
      plan: "Enterprise",
    },
    {
      name: "MediCare Clinic",
      logo: Stethoscope,
      plan: "Professional",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Patients",
      url: "/admin/patients",
      icon: Users,
    },
    {
      title: "Appointments",
      url: "/admin/appointments",
      icon: Hospital,
    },
    {
      title: "Doctors",
      url: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      title: "Staff",
      url: "/admin/staffs",
      icon: UserCheck,
    },
    {
      title: "Departments",
      url: "/admin/departments",
      icon: Building2,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
  ],
  projects: [
    {
      name: "View All Departments",
      url: "/admin/departments",
      icon: Building2,
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
