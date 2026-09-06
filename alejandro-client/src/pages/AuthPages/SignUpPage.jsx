import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { createUser } from '../../services/UserService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

const SignUpPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    contactNumber: '',
    address: '',
    role: 'buyer',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      await createUser({
        ...form,
        age: Number(form.age),
      });

      navigate('/auth/signin');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create your account.');
    } finally {
      setLoading(false);
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
        Sign Up
      </h1>

      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Create a store account for faster checkout, order updates, and pickup details.
      </p>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-firstname" className="text-sm font-medium text-zinc-700">
              First Name
            </label>
            <input
              id="signup-firstname"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First name"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="signup-lastname" className="text-sm font-medium text-zinc-700">
              Last Name
            </label>
            <input
              id="signup-lastname"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-username" className="text-sm font-medium text-zinc-700">
            Username
          </label>
          <input
            id="signup-username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className={inputClasses}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-age" className="text-sm font-medium text-zinc-700">
              Age
            </label>
            <input
              id="signup-age"
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="signup-gender" className="text-sm font-medium text-zinc-700">
              Gender
            </label>
            <select
              id="signup-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-contact" className="text-sm font-medium text-zinc-700">
              Contact Number
            </label>
            <input
              id="signup-contact"
              name="contactNumber"
              type="text"
              value={form.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="signup-address" className="text-sm font-medium text-zinc-700">
              Address
            </label>
            <input
              id="signup-address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-zinc-700">
            Email Address
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="text-sm font-medium text-zinc-700">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="new-password"
            className={inputClasses}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl bg-zinc-900 text-white ${actionButtonClassName} disabled:opacity-50`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" className={actionButtonClassName}>
            Sign Up with Google
          </Button>
          <Button type="button" variant="secondary" className={actionButtonClassName}>
            Sign Up with Apple
          </Button>
        </div>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
        Already have an account?{' '}
        <Link to="/auth/signin" className="font-semibold text-zinc-900 transition hover:text-zinc-600">
          Log In
        </Link>
      </div>
    </>
  );
};

export default SignUpPage;