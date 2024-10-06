import React from "react";
import { Navbar } from "./navbar/Navbar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen bg-base-100'>
      <Navbar />
      <main className='max-w-7xl mx-auto px-4 py-6'>{children}</main>
    </div>
  );
};
