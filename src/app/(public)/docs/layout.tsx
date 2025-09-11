import React from "react";

export const metadata = {
  title: "Documentation - City Gate Hospital",
  description:
    "Comprehensive user documentation for City Gate Hospital healthcare management platform",
};

const PublicDocsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen">{children}</div>;
};

export default PublicDocsLayout;
