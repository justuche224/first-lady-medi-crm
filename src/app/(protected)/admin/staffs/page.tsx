import React from "react";
import StaffsPage from "./staff";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
  return <StaffsPage />;
};

export default page;
