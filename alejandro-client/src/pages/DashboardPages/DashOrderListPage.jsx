import React, { useEffect, useState } from 'react';
import { TextField, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import placeholderImage from '../../assets/img/placeholder-product.png';

const statuses = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const DashOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawData = response?.data;
      const orderArray = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.orders || []);
      setOrders(Array.isArray(orderArray) ? orderArray : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/orders/${orderId}/status`, 
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status.');
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // Metrics
  const totalOrders = safeOrders.length;
  const pendingOrders = safeOrders.filter(o => (o.orderStatus || '').toLowerCase() === 'pending').length;
  const processingOrders = safeOrders.filter(o => (o.orderStatus || '').toLowerCase() === 'processing').length;
  const completedOrders = safeOrders.filter(o => (o.orderStatus || '').toLowerCase() === 'delivered' || (o.orderStatus || '').toLowerCase() === 'shipped').length;

  const filteredOrders = safeOrders.filter((o) => {
    const customerName = `${o.buyer?.firstName || ''} ${o.buyer?.lastName || ''} ${o.shippingAddress || ''}`.toLowerCase();
    const orderId = (o._id || o.id || '').toLowerCase();
    const status = (o.orderStatus || 'Pending');

    const matchesSearch = `${customerName} ${orderId}`.includes(search.toLowerCase());
    const matchesStatus = !statusFilter || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      field: '_id',
      headerName: 'ORDER ID / CUSTOMER',
      flex: 1.1,
      minWidth: 180,
      renderCell: (params) => {
        const idStr = params.row._id || params.row.id || '';
        const shortId = `#${idStr.substring(idStr.length - 6).toUpperCase()}`;
        const customerName = params.row.buyer?.firstName 
          ? `${params.row.buyer.firstName} ${params.row.buyer.lastName}` 
          : 'Customer';
        const customerEmail = params.row.buyer?.email || '';

        return (
          <div className="flex items-center gap-3 w-full py-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="leading-tight truncate">
              <div className="font-bold text-zinc-900 text-sm">{shortId}</div>
              <div className="text-xs text-zinc-700 font-medium mt-0.5">{customerName}</div>
              <div className="text-[11px] text-zinc-400 truncate">{customerEmail}</div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'products',
      headerName: 'PRODUCTS BOUGHT',
      flex: 1.5,
      minWidth: 260,
      renderCell: (params) => {
        const productList = params.row.products || [];
        return (
          <div className="py-2.5 space-y-2 w-full max-h-28 overflow-y-auto">
            {productList.map((item, idx) => {
              const prod = item.product;
              const imgUrl = prod?.images?.[0] || placeholderImage;
              const name = prod?.productName || 'Product Item';
              const qty = item.quantity || 1;
              const price = Number(item.price || prod?.price || 0);

              return (
                <div key={idx} className="flex items-center gap-2.5 bg-zinc-50 p-1.5 rounded-xl border border-zinc-200">
                  <img 
                    src={imgUrl} 
                    alt={name} 
                    onError={(e) => { e.target.src = placeholderImage; }}
                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-200" 
                  />
                  <div className="text-xs leading-tight truncate flex-1">
                    <p className="font-semibold text-zinc-900 truncate">{name}</p>
                    <p className="text-zinc-500 text-[11px]">Qty: {qty} × PHP {price.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      field: 'shippingAddress',
      headerName: 'DELIVERY ADDRESS',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <div className="py-2 text-xs text-zinc-700 leading-relaxed truncate" title={params.row.shippingAddress}>
          <span className="font-medium text-zinc-900 block truncate">{params.row.shippingAddress || 'No address provided'}</span>
          <span className="text-[11px] text-zinc-400">Contact: {params.row.buyer?.contactNumber || 'N/A'}</span>
        </div>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'PAYMENT',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const method = params.row.paymentMethod || 'Cash';
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {method}
          </span>
        );
      },
    },
    {
      field: 'totalAmount',
      headerName: 'TOTAL AMOUNT',
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => (
        <span className="font-bold text-zinc-900 text-sm">
          PHP {Number(params.row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      field: 'orderStatus',
      headerName: 'STATUS',
      flex: 1.1,
      minWidth: 170,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="w-full flex items-center justify-center py-1">
          <TextField
            select
            size="small"
            value={params.row.orderStatus || 'Pending'}
            onChange={(e) => handleStatusChange(params.row._id || params.row.id, e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '12px' }
            }}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status} sx={{ fontSize: '13px' }}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-lexend">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Orders Management</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Review customer purchases, monitor delivery destinations, and update order statuses.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{totalOrders}</h2><p className="text-xs text-zinc-400 mt-0.5">All customer transactions</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{pendingOrders}</h2><p className="text-xs text-zinc-400 mt-0.5">Awaiting processing</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Processing</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{processingOrders}</h2><p className="text-xs text-zinc-400 mt-0.5">Currently processing</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fulfilled</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{completedOrders}</h2><p className="text-xs text-zinc-400 mt-0.5">Successfully fulfilled</p></div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs gap-3">
        <TextField
          size="small"
          placeholder="Search by order ID, customer name, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <TextField
          select
          size="small"
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-sm">Order Records</h3>
          <div className="text-xs font-semibold text-zinc-400">{filteredOrders.length} results</div>
        </div>

        <DataGrid
          rows={filteredOrders}
          columns={columns}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={96}
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

export default DashOrderListPage;