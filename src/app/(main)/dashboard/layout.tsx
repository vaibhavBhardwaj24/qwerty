import { CustomProvider } from "@/lib/providers/customProvider";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CustomProvider>
      <main className="flex w-full h-full">{children}</main>
    </CustomProvider>
  );
};

export default DashboardLayout;
