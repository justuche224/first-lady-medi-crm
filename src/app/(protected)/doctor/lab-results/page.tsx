import React from 'react'
import DoctorLabResultsPage from './lab-results'
import { redirect } from 'next/navigation';
import { serverAuth } from '@/lib/server-auth';
const page = async () => {
    const user = await serverAuth();
  if (!user) {
    redirect("/");
  }
  if (user.role !== "doctor") {
    redirect("/dashboard");
  }
  return (
    <DoctorLabResultsPage />
  )
}

export default page