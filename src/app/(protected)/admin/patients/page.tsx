import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import PatientsPage from "./patients";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
  return <PatientsPage />;
};

export default page;
