import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role === "admin") {
    return redirect("/admin");
  }
  if (user.role === "doctor") {
    return redirect("/doctor");
  }
  if (user.role === "patient") {
    return redirect("/patient");
  }
  return redirect("/");
};

export default page;
