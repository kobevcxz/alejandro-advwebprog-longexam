  import React, { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import Button from '../../components/Button';
  import { loginUser } from '../../services/UserService';
  import { useAuth } from '../../context/AuthContext';
  import ArrowBackIcon from '@mui/icons-material/ArrowBack';

  const inputClasses =
    'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

  const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

  const SignInPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth() || {};

    const [form, setForm] = useState({
      email: '',
      password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
      setError('');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
        const response = await loginUser(form);
        const resData = response.data || {};
        
        const token = resData.token || resData.accessToken;
        
        // Explicitly capture the user ID and role from backend response
        const userId = resData.id || resData._id || resData.user?.id || resData.user?._id;
        const userRole = (resData.role || resData.type || resData.user?.role || 'buyer').toLowerCase();
        const userFirstName = resData.firstName || resData.name || resData.user?.firstName || '';
        const userEmail = resData.email || resData.user?.email || form.email;

        // Construct a clean, complete user object with role guaranteed to be present ('buyer' by default)
        const userData = {
          ...resData,
          ...resData.user,
          id: userId,
          _id: userId,
          email: userEmail,
          firstName: userFirstName,
          role: userRole === 'admin' || userRole === 'seller' ? userRole : 'buyer',
        };

        if (login) {
          login(userData, token);
        } else {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
        }

        // Admin & Sellers route directly to DashProductListPage (/admin/products)
        if (userData.role === 'admin' || userData.role === 'seller') {
          navigate('/admin/products', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    };

    return (
      <>
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
          >
            <ArrowBackIcon fontSize="small" />
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Log In
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Access your store account to review orders, saved items, and pickup details.
        </p>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="signin-email" className="text-sm font-medium text-zinc-700">
              Email Address
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@email.com"
              autoComplete="email"
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label htmlFor="signin-password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              className={inputClasses}
              required
            />
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              It must be a combination of minimum 8 letters, numbers, and symbols.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-zinc-600">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 accent-zinc-900" />
              <span>Remember me</span>
            </label>
            <button type="button" className="font-medium text-zinc-700 transition hover:text-zinc-900">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className={`w-full rounded-xl bg-zinc-900 text-white ${actionButtonClassName}`}>
            Log In
          </button>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Button type="button" variant="secondary" className={actionButtonClassName}>
              Log In with Google
            </Button>
            <Button type="button" variant="secondary" className={actionButtonClassName}>
              Log In with Apple
            </Button>
          </div>
        </form>

        <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
          No account yet?{' '}
          <Link to="/auth/signup" className="font-semibold text-zinc-900 transition hover:text-zinc-600">
            Sign Up
          </Link>
        </div>
      </>
    );
  };

  export default SignInPage;