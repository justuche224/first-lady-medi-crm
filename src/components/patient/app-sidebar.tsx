"use client";

import * as React from "react";
import {
  Heart,
  Calendar,
  FileText,
  Pill,
  TestTube,
  MessageSquare,
  MessageCircle,
  Bell,
  Settings,
  User,
  Home,
  Activity,
  Shield,
} from "lucide-react";

import { NavMain } from "@/components/patient/nav-main";
import { NavProjects } from "@/components/patient/nav-projects";
import { NavUser } from "@/components/patient/nav-user";
import { TeamSwitcher } from "@/components/patient/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Patient portal navigation data
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, error, isPending } = authClient.useSession();
  const data = {
    user: {
      name: isPending ? "Loading..." : error ? "Error!" : session?.user?.name || "",
      email: isPending ? "Loading..." : error ? "Error!" : session?.user?.email || "",
      avatar: isPending ? "Loading..." : error ? "Error!" : session?.user?.image || "/boy.png",
    },
    teams: [
      {
        name: "My Health",
        logo: Heart,
        plan: "Patient",
      },
    ],
    navMain: [
      {
        title: "Overview",
        url: "/patient",
        icon: Home,
        isActive: true,
      },
      {
        title: "My Profile",
        url: "/patient/profile",
        icon: User,
      },
      {
        title: "Appointments",
        url: "/patient/appointments",
        icon: Calendar,
        items: [
          {
            title: "Upcoming",
            url: "/patient/appointments?status=scheduled",
          },
          {
            title: "Past",
            url: "/patient/appointments?status=completed",
          },
          {
            title: "Book New",
            url: "/patient/appointments/book",
          },
        ],
      },
      {
        title: "Medical Records",
        url: "/patient/medical-records",
        icon: FileText,
      },
      {
        title: "Medications",
        url: "/patient/medications",
        icon: Pill,
        items: [
          {
            title: "Current",
            url: "/patient/medications?status=active",
          },
          {
            title: "Past",
            url: "/patient/medications?status=completed",
          },
          {
            title: "Refill Requests",
            url: "/patient/medications/refills",
          },
        ],
      },
      {
        title: "Lab Results",
        url: "/patient/lab-results",
        icon: TestTube,
        items: [
          {
            title: "Recent",
            url: "/patient/lab-results?status=completed",
          },
          {
            title: "Pending",
            url: "/patient/lab-results?status=pending",
          },
        ],
      },
      {
        title: "Messages",
        url: "/patient/messages",
        icon: MessageSquare,
        items: [
          {
            title: "Inbox",
            url: "/patient/messages",
          },
          {
            title: "Sent",
            url: "/patient/messages/sent",
          },
          {
            title: "Compose",
            url: "/patient/messages/compose",
          },
        ],
      },
      {
        title: "Feedback",
        url: "/patient/feedback",
        icon: MessageCircle,
      },
    ],
    projects: [
      {
        name: "Health Dashboard",
        url: "/patient",
        icon: Activity,
      },
      {
        name: "Notifications",
        url: "/patient/notifications",
        icon: Bell,
      },
      {
        name: "Privacy & Security",
        url: "/patient/settings",
        icon: Shield,
      },
      {
        name: "Settings",
        url: "/patient/settings",
        icon: Settings,
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
