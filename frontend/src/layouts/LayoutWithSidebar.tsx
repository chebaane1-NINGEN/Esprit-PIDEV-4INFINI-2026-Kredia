import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import SidebarFixed from '../components/SidebarFixed';
import { useAuth } from '../contexts/AuthContext';

interface LayoutWithSidebarProps {
  role: 'admin' | 'agent';
}

const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="ml-2 text-lg font-bold text-gray-900">Kredia</span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop Sidebar - Always Visible */}
      <SidebarFixed isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} role={role} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Header */}
        <div className="hidden lg:block fixed top-0 right-0 left-64 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {role} Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {currentUser?.firstName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add any header actions here */}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="pt-16 lg:pt-16">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
