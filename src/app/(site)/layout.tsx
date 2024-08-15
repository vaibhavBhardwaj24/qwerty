import React from "react";

const HomePageLayout = ({ children }: { children: React.ReactNode }) => {
  return <main className="w-full h-full">{children}</main>;
};

export default HomePageLayout;
