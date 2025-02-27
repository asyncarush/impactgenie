'use client';

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome, {user?.firstName || 'User'}!
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard content will go here */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <p className="text-lg">Coming soon...</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <p className="text-lg">No recent activity</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <p className="text-lg">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
