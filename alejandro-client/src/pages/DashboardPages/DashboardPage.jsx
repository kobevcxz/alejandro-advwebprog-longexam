import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Select, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalOrders: 0, totalReviews: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, usersRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:8000/api/products').catch(() => ({ data: [] })),
        axios.get('http://localhost:8000/api/users', authHeader).catch(() => ({ data: [] })),
        axios.get('http://localhost:8000/api/orders').catch(() => ({ data: [] })),
      ]);

      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || productsRes.data?.products || []);
      const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || usersRes.data?.users || []);
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || ordersRes.data?.orders || []);

      setStats({
        totalProducts: products.length,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((acc, o) => acc + Number(o.totalAmount || o.totalPrice || 0), 0),
      });

      setRecentOrders(orders);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const filteredOrders = recentOrders.filter((o) => {
    const customerName = `${o.user?.firstName || ''} ${o.user?.lastName || ''} ${o.shippingAddress?.fullName || o.customerName || ''}`.toLowerCase();
    const orderId = (o._id || o.id || '').toLowerCase();
    return `${customerName} ${orderId}`.includes(search.toLowerCase());
  });

  const columns = [
    {
      field: 'orderId',
      headerName: 'ORDER ID',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => {
        const o = params.row;
        const idStr = o._id || o.id || '';
        const shortId = `#${idStr.substring(idStr.length - 6).toUpperCase()}`;
        const customerName = o.user?.firstName ? `${o.user.firstName} ${o.user.lastName}` : (o.shippingAddress?.fullName || 'Customer');

        return (
          <div className="flex items-center gap-3 w-full py-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-zinc-900 text-sm">{shortId}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{customerName}</div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'totalAmount',
      headerName: 'TOTAL AMOUNT',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <span className="font-semibold text-zinc-900">
          PHP {Number(params.row.totalAmount || params.row.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const status = (params.row.status || 'PENDING').toUpperCase();
        let badgeColor = 'bg-amber-50 text-amber-600 border-amber-200';
        if (status === 'COMPLETED' || status === 'DELIVERED') badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (status === 'READY FOR CLAIMING' || status === 'READY') badgeColor = 'bg-blue-50 text-blue-600 border-blue-100';

        return (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border tracking-wider ${badgeColor}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Welcome back! Here is a summary of BulldogEx Shop performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-zinc-900">PHP {Number(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Lifetime sales volume</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-zinc-900">{stats.totalOrders}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Customer transactions</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-zinc-900">{stats.totalProducts}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Active catalog items</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Users</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-zinc-900">{stats.totalUsers}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Registered accounts</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <TextField
          size="small"
          placeholder="Search recent orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 380, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <div className="text-xs font-semibold text-zinc-400">Recent Activity Feed</div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-sm">Recent Orders</h3>
          <div className="text-xs font-semibold text-zinc-400">{filteredOrders.length} transactions</div>
        </div>

        <DataGrid
          rows={filteredOrders}
          columns={columns}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={76}
          sx={{
            border: 'none',
            fontFamily: 'inherit',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              color: '#71717a',
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #e4e4e7',
            },
            '& .MuiDataGrid-cell': { borderColor: '#f4f4f5', display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#fafafa' },
          }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;