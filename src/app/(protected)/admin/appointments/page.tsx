import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import AppointmentsPage from "./appointments";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
  return <AppointmentsPage />;
};

export default page;
