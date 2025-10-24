import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Header } from './Header';

export const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-white border-r border-gray-200">
        <Sidebar />
      </aside>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};