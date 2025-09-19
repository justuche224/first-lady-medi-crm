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
  Bed,
  Calendar,
  Link,
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
import { authClient } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, error, isPending } = authClient.useSession();
  const data = {
    user: {
      name: isPending
        ? "Loading..."
        : error
        ? "Error!"
        : session?.user?.name || "",
      email: isPending
        ? "Loading..."
        : error
        ? "Error!"
        : session?.user?.email || "",
      avatar: isPending
        ? "Loading..."
        : error
        ? "Error!"
        : session?.user?.image || "/boy.png",
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
        title: "Patient Assignments",
        url: "/admin/assignments",
        icon: Link,
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
        title: "Bed Spaces",
        url: "/admin/beds",
        icon: Bed,
      },
      {
        title: "Occupancy",
        url: "/admin/occupancy",
        icon: Calendar,
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
