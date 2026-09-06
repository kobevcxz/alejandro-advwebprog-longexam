import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';
import { useAuth } from '../context/AuthContext';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const buyerLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Cart', to: '/cart' },
];

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Manage Products', to: '/admin/products' },
  { label: 'Manage Orders', to: '/admin/orders' },
];

const navLinkClassName = ({ isActive }) =>
  [
    'rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition',
    isActive
      ? 'border-[#003A8F] bg-[#003A8F] text-white'
      : 'border-transparent text-zinc-500 hover:border-[#003A8F] hover:bg-[#003A8F] hover:text-white',
  ].join(' ');

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/auth/signin');
  };

  const isAdminOrSeller = user?.role === 'admin' || user?.role === 'seller';
  const activeLinks = isAdminOrSeller ? adminLinks : buyerLinks;

  const getFirstName = () => {
    if (!user) return '';
    if (user.firstName) return user.firstName;
    const rawName = user.name || user.fullName || '';
    if (rawName.trim()) {
      return rawName.trim().split(' ')[0];
    }
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#003A8F] bg-white/95 backdrop-blur font-lexend">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="BulldogEx"
            className="h-9 w-9 rounded-full border border-[#003A8F] bg-white object-contain"
          />
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-[#003A8F]">
              {isAdminOrSeller ? 'BulldogEx Admin' : 'BulldogEx Shop'}
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-3 md:flex">
          {activeLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/admin'}
              className={navLinkClassName}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Conditional rendering: Show Hover Dropdown Profile if logged in, Sign In & Sign Up if logged out */}
          {user ? (
            <div 
              className="relative inline-block pl-2 border-l border-zinc-200"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[#003A8F]/30 bg-[#EEF2FF] px-4 py-1.5 text-xs font-semibold text-[#003A8F] hover:border-[#003A8F] transition cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{getFirstName()}</span>
              </button>

              {/* Hover Pop-up Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border-2 border-zinc-900 bg-white p-2 shadow-xl z-50">
                  <div className="flex flex-col">
                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-zinc-700 rounded-xl hover:bg-zinc-100 transition"
                    >
                      <SettingsOutlinedIcon fontSize="small" className="text-zinc-500" />
                      Profile Settings
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-zinc-700 rounded-xl hover:bg-zinc-100 transition"
                    >
                      <ShoppingBagOutlinedIcon fontSize="small" className="text-zinc-500" />
                      My Orders
                    </Link>

                    <div className="border-t border-zinc-200 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 rounded-xl hover:bg-red-50 transition text-left cursor-pointer"
                    >
                      <LogoutOutlinedIcon fontSize="small" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
              <NavLink to="/auth/signin" className={navLinkClassName}>
                Sign In
              </NavLink>

              <NavLink
                to="/auth/signup"
                className="rounded-full border border-[#FDB913] bg-[#FDB913] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#003A8F] transition hover:bg-[#e0a80f]"
              >
                Sign Up
              </NavLink>
            </div>
          )}

        </nav>  

      </div>
    </header>
  );
};

export default NavBar;