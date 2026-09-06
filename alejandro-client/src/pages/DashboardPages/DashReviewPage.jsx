import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Rating,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const DashReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  // Edit Review Modal State
  const [open, setOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawData = response?.data;
      const reviewArray = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.reviews || []);
      setReviews(Array.isArray(reviewArray) ? reviewArray : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleOpenEdit = (review) => {
    setEditReviewId(review._id || review.id);
    setEditForm({
      rating: review.rating || 5,
      comment: review.comment || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditReviewId(null);
  };

  const handleSaveReview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/reviews/${editReviewId}`,
        {
          rating: Number(editForm.rating),
          comment: editForm.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await loadReviews();
      handleClose();
    } catch (error) {
      console.error('Error updating review:', error);
      alert(error.response?.data?.message || 'Failed to update review.');
    }
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Metrics
  const totalReviews = safeReviews.length;
  const averageRating = totalReviews > 0 
    ? (safeReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1) 
    : '0.0';
  const fiveStarReviews = safeReviews.filter(r => Number(r.rating) === 5).length;
  const lowReviews = safeReviews.filter(r => Number(r.rating) <= 2).length;

  const filteredReviews = safeReviews.filter((r) => {
    const productName = r.product?.productName || '';
    const reviewerName = r.reviewer?.firstName ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : (r.reviewerName || '');
    const comment = r.comment || '';
    
    const searchString = `${productName} ${reviewerName} ${comment}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    
    const matchesRating = ratingFilter === 'ALL' || Number(r.rating) === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

  const columns = [
    {
      field: 'product',
      headerName: 'PRODUCT',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => {
        const productName = params.row.product?.productName || 'Unknown Product';
        return <span className="font-semibold text-zinc-900 text-sm">{productName}</span>;
      },
    },
    {
      field: 'rating',
      headerName: 'RATING',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Rating value={Number(params.row.rating || 0)} readOnly size="small" />
          <span className="text-xs font-bold text-zinc-700">({params.row.rating})</span>
        </div>
      ),
    },
    {
      field: 'comment',
      headerName: 'COMMENT',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params) => (
        <span className="text-zinc-600 text-xs truncate py-2" title={params.row.comment}>
          {params.row.comment || 'No comment provided'}
        </span>
      ),
    },
    {
      field: 'reviewer',
      headerName: 'REVIEWER',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const rev = params.row.reviewer;
        const name = rev?.firstName ? `${rev.firstName} ${rev.lastName}` : (params.row.reviewerName || 'Anonymous');
        return <span className="text-zinc-700 text-xs font-medium">{name}</span>;
      },
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <button
          onClick={() => handleOpenEdit(params.row)}
          className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition cursor-pointer"
        >
          Edit Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Reviews</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Monitor customer feedback and product ratings.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{totalReviews}</h2><p className="text-xs text-zinc-400 mt-0.5">Submitted customer feedback</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Average Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{averageRating} / 5</h2><p className="text-xs text-zinc-400 mt-0.5">Overall store rating</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">5-Star Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{fiveStarReviews}</h2><p className="text-xs text-zinc-400 mt-0.5">Top-tier ratings</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Low Ratings</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{lowReviews}</h2><p className="text-xs text-zinc-400 mt-0.5">Ratings of 2 stars or lower</p></div>
        </div>
      </div>

      {/* Search and Rating Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs gap-3">
        <TextField
          size="small"
          placeholder="Search by product, reviewer, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 380, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            displayEmpty
            sx={{ borderRadius: '12px', fontSize: '13px' }}
          >
            <MenuItem value="ALL">All Ratings</MenuItem>
            <MenuItem value="5">5 Stars</MenuItem>
            <MenuItem value="4">4 Stars</MenuItem>
            <MenuItem value="3">3 Stars</MenuItem>
            <MenuItem value="2">2 Stars</MenuItem>
            <MenuItem value="1">1 Star</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-sm">Review Records</h3>
          <div className="text-xs font-semibold text-zinc-400">{filteredReviews.length} results</div>
        </div>

        <DataGrid
          rows={filteredReviews}
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
            '& .MuiDataGrid-cell': { borderColor: '#f4f4f5', display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#fafafa' },
          }}
        />
      </div>

      {/* Edit Review Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle className="font-bold text-zinc-900 border-b border-zinc-100">Edit Customer Review</DialogTitle>
        <DialogContent className="space-y-4 pt-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Rating</label>
            <div>
              <Rating
                value={Number(editForm.rating)}
                onChange={(e, newValue) => setEditForm({ ...editForm, rating: newValue || 5 })}
              />
            </div>
          </div>
          <TextField
            label="Comment"
            multiline
            rows={4}
            value={editForm.comment}
            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions className="p-4 border-t border-zinc-100">
          <button onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer">Cancel</button>
          <button onClick={handleSaveReview} className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm cursor-pointer">Save Changes</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DashReviewPage;