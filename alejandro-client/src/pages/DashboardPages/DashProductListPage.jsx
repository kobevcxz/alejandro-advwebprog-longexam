import React, { useEffect, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/ProductService';
import { fetchUsers } from '../../services/UserService';
import placeholderImage from '../../assets/img/placeholder-product.png';

const DashProductListPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State for Create/Edit
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ 
    productName: '', 
    price: '', 
    stock: '', 
    category: '', 
    seller: '',
    images: '' 
  });

  // Bulletproof helper to extract user ID from state, localStorage, or JWT token
  const getActiveUserId = () => {
    // 1. Check user state object
    if (user) {
      if (typeof user === 'string') return user;
      const foundId = user._id || user.id || user.userId || user.uid || user.sub || user.user?._id || user.user?.id;
      if (foundId) return foundId;
    }

    // 2. Check localStorage 'user' object
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (typeof storedUser === 'string') return storedUser;
      const storedId = storedUser._id || storedUser.id || storedUser.userId || storedUser.uid || storedUser.sub || storedUser.user?._id;
      if (storedId) return storedId;
    } catch (e) {
      console.error('Error reading user from localStorage', e);
    }

    // 3. Fallback: Try decoding the JWT token payload if stored in localStorage
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken?.id || decodedToken?._id || decodedToken?.userId || decodedToken?.sub || '';
      }
    } catch (e) {
      console.error('Error decoding token', e);
    }

    return '';
  };

  const loadSellers = async () => {
    try {
      const response = await fetchUsers();
      const rawData = response?.data;
      const userList = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.users || []);
      setSellers(userList.filter((u) => (u.role || u.type || '').toLowerCase() === 'seller'));
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const currentUserId = getActiveUserId();
      
      const userRole = (user?.role || '').toLowerCase();
      const response = userRole === 'admin' 
        ? await fetchProducts() 
        : await fetchProducts({ seller: currentUserId });
      
      const rawData = response?.data;
      const productArray = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.products || []);
      setProducts(Array.isArray(productArray) ? productArray : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    if ((user?.role || '').toLowerCase() === 'admin') {
      loadSellers();
    }
  }, [user]);

  // Helper function to capitalize the first letter of words automatically
  const formatCategoryInput = (val) => {
    return val
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleOpenCreate = () => {
    document.activeElement?.blur();
    setIsEditing(false);
    setSelectedId(null);
    const currentUserId = getActiveUserId();
    const userRole = (user?.role || '').toLowerCase();

    setFormData({ 
      productName: '', 
      price: '', 
      stock: '', 
      category: '', 
      seller: userRole === 'seller' ? currentUserId : '', 
      images: '' 
    });
    setOpen(true);
  };

  const handleOpenEdit = (product) => {
    document.activeElement?.blur();
    setIsEditing(true);
    setSelectedId(product._id || product.id);
    
    const rawCategory = typeof product.category === 'object' && product.category !== null
      ? (product.category?.categoryName || product.category?.name || '') 
      : (product.category || '');

    const sellerVal = typeof product.seller === 'object' && product.seller !== null
      ? (product.seller?._id || product.seller?.id || '') 
      : (product.seller || '');

    const imageString = Array.isArray(product.images) 
      ? product.images.join(', ') 
      : (product.images || '');

    setFormData({
      productName: product.productName || product.name || '',
      price: product.price || '',
      stock: product.stock ?? product.quantity ?? '',
      category: formatCategoryInput(rawCategory),
      seller: sellerVal,
      images: imageString,
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      const currentUserId = getActiveUserId();
      const userRole = (user?.role || '').toLowerCase();

      const resolvedSeller = userRole === 'admin' 
        ? (formData.seller || currentUserId) 
        : (currentUserId || formData.seller);

      console.log('--- DEBUG PRODUCT SUBMISSION ---');
      console.log('Current User State:', user);
      console.log('Resolved Seller ID:', resolvedSeller);

      if (!formData.productName || !formData.price || !formData.category || !resolvedSeller) {
        alert(`Missing required fields. Name: ${!!formData.productName}, Price: ${!!formData.price}, Category: ${!!formData.category}, SellerID: ${!!resolvedSeller} (Found ID: "${resolvedSeller}")`);
        return;
      }

      const payload = {
        productName: formData.productName,
        name: formData.productName,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        quantity: Number(formData.stock),
        seller: resolvedSeller,
        images: formData.images
          ? formData.images.split(',').map((img) => img.trim()).filter(Boolean)
          : [],
      };

      if (isEditing) {
        if (!selectedId) {
          alert('Error: Product ID is missing for update.');
          return;
        }
        await updateProduct(selectedId, payload);
      } else {
        await createProduct(payload);
      }
      
      await loadProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to save product. Check console details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];

  const totalProducts = safeProducts.length;
  const inStockCount = safeProducts.filter(p => Number(p.stock ?? p.quantity ?? 0) > 0).length;
  const outOfStockCount = safeProducts.filter(p => Number(p.stock ?? p.quantity ?? 0) <= 0).length;

  const filteredProducts = safeProducts.filter((p) => {
    const name = p.productName || p.name || '';
    const catName = typeof p.category === 'object' && p.category !== null ? (p.category?.categoryName || p.category?.name || '') : (p.category || '');
    return `${name} ${catName}`.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
    {
      field: 'productName',
      headerName: 'PRODUCT NAME',
      flex: 1.5,
      minWidth: 240,
      renderCell: (params) => {
        const rowCategory = params.row.category;
        const categoryDisplay = typeof rowCategory === 'object' && rowCategory !== null
          ? (rowCategory?.categoryName || rowCategory?.name || 'Uncategorized')
          : (rowCategory || 'Uncategorized');

        const imageUrl = params.row.images?.[0] || placeholderImage;

        return (
          <div className="flex items-center gap-3 w-full py-2">
            <img 
              src={imageUrl} 
              alt="Product" 
              className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0"
              onError={(e) => { e.target.src = placeholderImage; }}
            />
            <div className="leading-tight">
              <div className="font-bold text-zinc-900 text-sm">
                {params.row.productName || params.row.name}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {categoryDisplay}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'price',
      headerName: 'PRICE',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-semibold text-zinc-900">
          PHP {Number(params.row.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      field: 'stock',
      headerName: 'STOCK',
      flex: 0.8,
      minWidth: 110,
      renderCell: (params) => {
        const stockVal = params.row.stock ?? params.row.quantity ?? 0;
        return (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
            stockVal > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {stockVal} in stock
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(params.row)}
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.row._id || params.row.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Products</h1>
          <p className="text-sm text-zinc-500 mt-0.5">View and manage store inventory.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{totalProducts}</h2><p className="text-xs text-zinc-400 mt-0.5">All registered inventory</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">In Stock Items</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{inStockCount}</h2><p className="text-xs text-zinc-400 mt-0.5">Available for purchase</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Out of Stock</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{outOfStockCount}</h2><p className="text-xs text-zinc-400 mt-0.5">Needs restoking</p></div>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <TextField
          size="small"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 350, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <div className="text-xs font-semibold text-zinc-400">
          {filteredProducts.length} results
        </div>
      </div>

      {/* DataGrid Container */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-sm">Product Inventory</h3>
        </div>

        <DataGrid
          rows={filteredProducts}
          columns={columns}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 20, 50]}
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
            '& .MuiDataGrid-cell': {
              borderColor: '#f4f4f5',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#fafafa',
            },
          }}
        />
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle className="font-bold text-zinc-900 border-b border-zinc-100">
          {isEditing ? 'Edit Product Item' : 'Add New Product'}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4 mt-2">
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            label="Category Name"
            fullWidth
            margin="normal"
            placeholder="e.g. Apparel, Accessories, Electronics"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: formatCategoryInput(e.target.value) })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          {/* Show Seller dropdown only if logged in as Admin */}
          {(user?.role || '').toLowerCase() === 'admin' && (
            <TextField
              select
              label="Seller"
              fullWidth
              margin="normal"
              value={formData.seller}
              onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            >
              {sellers.map((s) => (
                <MenuItem key={s._id || s.id} value={s._id || s.id}>
                  {s.firstName} {s.lastName} ({s.email})
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Image URLs (comma separated)"
            fullWidth
            margin="normal"
            placeholder="https://example.com/image1.jpg"
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Price (PHP)"
              type="number"
              fullWidth
              margin="normal"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Stock Quantity"
              type="number"
              fullWidth
              margin="normal"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t border-zinc-100">
          <button onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm cursor-pointer">
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DashProductListPage;