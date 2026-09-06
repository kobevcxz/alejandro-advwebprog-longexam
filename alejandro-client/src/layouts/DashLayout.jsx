import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const DashLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve logged-in user profile safely from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/signin');
  };

  const mainNav = [
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ) 
    },
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ) 
    },
    { 
      name: 'Reviews', 
      path: '/admin/reviews', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) 
    },
  ];

  const adminNav = [
    { 
      name: 'Manage Users', 
      path: '/admin/users', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) 
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between z-20 shadow-xs">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 gap-3 border-b border-zinc-100">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              B
            </div>
            <span className="font-bold text-zinc-900 tracking-tight">BulldogEx Shop</span>
          </div>

          {/* Navigation Sections */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Main Menu</p>
              <nav className="space-y-1">
                {mainNav.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Render Administration Section only if user is admin */}
            {user?.role === 'admin' && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Administration</p>
                <nav className="space-y-1">
                  {adminNav.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 z-10 shadow-2xs">
          <div className="text-sm font-medium text-zinc-600">
            {/* Optional breadcrumb or page context */}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {userInitials || 'LG'}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900 leading-none">{userName}</p>
              <p className="text-[11px] font-medium text-blue-600 mt-0.5 capitalize">{user?.type || user?.role || 'Admin'}</p>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashLayout;