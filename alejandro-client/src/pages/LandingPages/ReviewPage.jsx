import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders } from '../../services/OrderService';
import Button from '../../components/Button';
import placeholderImage from '../../assets/img/placeholder-product.png';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import axios from 'axios';

const ReviewPage = () => {
  const { user } = useAuth();

  const getUserId = () => {
    if (user) {
      if (typeof user === 'string') return user;
      if (user._id) return user._id;
      if (user.id) return user.id;
    }
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (typeof parsed === 'string') return parsed;
        const found = parsed._id || parsed.id || parsed.userId || parsed.user?._id;
        if (found) return found;
      }
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken.id || decodedToken._id || decodedToken.userId || '';
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  const userId = getUserId();
  const [activeTab, setActiveTab] = useState('toReview');
  const [deliveredProducts, setDeliveredProducts] = useState([]);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    const loadReviewData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch user orders
        const ordersResponse = await fetchMyOrders(userId);
        const ordersList = ordersResponse.data?.data || ordersResponse.data || [];

        const deliveredOrders = Array.isArray(ordersList) ? ordersList.filter(
          (order) => (order.orderStatus || '').toLowerCase() === 'delivered'
        ) : [];

        const items = [];
        deliveredOrders.forEach((order) => {
          if (order.products && Array.isArray(order.products)) {
            order.products.forEach((item) => {
              if (item.product) {
                const prodId = typeof item.product === 'string' ? item.product : (item.product._id || item.product.id);
                items.push({
                  orderId: order._id,
                  product: item.product,
                  productId: prodId,
                  quantity: item.quantity,
                  price: item.price,
                  deliveredAt: order.updatedAt || order.createdAt,
                });
              }
            });
          }
        });

        // 2. Fetch existing reviews safely
        let userReviewProductIds = new Set();
        let historyItems = [];

        try {
          const reviewsResponse = await axios.get('http://localhost:8000/api/reviews', { headers });
          const allReviews = reviewsResponse.data?.data || reviewsResponse.data?.reviews || reviewsResponse.data || [];
          
          if (Array.isArray(allReviews)) {
            allReviews.forEach((r) => {
              const revUserId = r.reviewer?._id || r.reviewer || r.user;
              if (revUserId && userId && String(revUserId) === String(userId)) {
                const reviewedProdId = typeof r.product === 'string' ? r.product : (r.product?._id || r.product?.id);
                if (reviewedProdId) {
                  userReviewProductIds.add(String(reviewedProdId));
                  historyItems.push({
                    product: r.product,
                    rating: r.rating,
                    reviewText: r.comment || 'No written comment provided.',
                    reviewedAt: r.createdAt || new Date().toISOString(),
                  });
                }
              }
            });
          }
        } catch (revErr) {
          console.warn('Could not fetch review history from server, showing local items:', revErr);
        }

        setReviewedProducts(historyItems);

        // Separate into pending items ensuring unique product tracking
        const pendingItems = items.filter((item) => {
          const pId = String(item.productId || '');
          return !userReviewProductIds.has(pId);
        });

        setDeliveredProducts(pendingItems);
      } catch (requestError) {
        console.error('Error fetching review tracking data:', requestError);
        setError('Unable to load products for review.');
      } finally {
        setLoading(false);
      }
    };

    loadReviewData();
  }, [userId]);

  const handleRatingChange = (productId, rating) => {
    setRatings((prev) => ({ ...prev, [productId]: rating }));
  };

  const handleReviewChange = (productId, text) => {
    setReviews((prev) => ({ ...prev, [productId]: text }));
  };

  const handleSubmitReview = async (item) => {
    const prodId = item.productId || item.product._id || item.product.id;
    const rating = ratings[prodId];
    const reviewText = reviews[prodId];

    if (!rating) {
      alert('Please select a star rating before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        product: prodId,
        rating: Number(rating),
        comment: reviewText || '',
        reviewer: userId,
      };

      // Post review to backend so DashReviewPage captures it
      await axios.post('http://localhost:8000/api/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const completedReview = {
        ...item,
        rating,
        reviewText: reviewText || 'No written comment provided.',
        reviewedAt: new Date().toISOString(),
      };

      setReviewedProducts((prev) => [completedReview, ...prev]);
      setDeliveredProducts((prev) => prev.filter((p) => String(p.productId || p.product._id || p.product.id) !== String(prodId)));
      
      setSubmittedMessage('Thank you! Your product review has been successfully submitted.');
      setTimeout(() => setSubmittedMessage(''), 4000);
    } catch (err) {
      console.error('Failed to post review:', err);
      alert(err.response?.data?.message || 'Unable to submit review to server.');
    }
  };

  if (loading) {
    return <p className="p-16 text-center font-lexend text-zinc-500 text-sm">Loading your review items...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      <section className="border-y-2 border-[#003A8F] bg-white px-4 py-6 sm:px-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
          Feedback & Ratings
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Product Reviews
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Rate items from your delivered purchases or view your past review history.
        </p>
      </section>

      <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('toReview')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'toReview'
              ? 'bg-[#003A8F] text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <RateReviewOutlinedIcon fontSize="small" />
          To Review ({deliveredProducts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#003A8F] text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <HistoryOutlinedIcon fontSize="small" />
          Review History ({reviewedProducts.length})
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {submittedMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">
          {submittedMessage}
        </div>
      )}

      {activeTab === 'toReview' && (
        <>
          {deliveredProducts.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-[#003A8F]/30 bg-white p-12 text-center shadow-2xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003A8F]/10 text-[#003A8F] mb-4">
                <RateReviewOutlinedIcon fontSize="large" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">No products waiting for review</h2>
              <p className="mt-2 text-sm text-zinc-600">Products from orders marked as <strong>Delivered</strong> will appear here.</p>
              <div className="mt-6">
                <Button to="/orders">View My Orders</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {deliveredProducts.map((item, index) => {
                const product = typeof item.product === 'object' ? item.product : {};
                const prodId = item.productId || index;
                const currentRating = ratings[prodId] || 0;

                return (
                  <article
                    key={`toreview-${prodId}-${index}`}
                    className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-[#003A8F]/40 transition space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200">
                          <img
                            src={product?.images?.[0] || placeholderImage}
                            alt={product?.productName || 'Product'}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = placeholderImage;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 text-base">
                            {product?.productName || product?.title || 'Delivered Product'}
                          </h3>
                          <p className="text-xs font-semibold text-[#003A8F] mt-0.5">
                            PHP {Number(item.price || 0).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200 uppercase tracking-wide">
                          Awaiting Review
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block">
                          Your Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(prodId, star)}
                              className={`text-2xl transition cursor-pointer ${
                                star <= currentRating ? 'text-[#FDB913]' : 'text-zinc-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <span className="ml-2 text-xs font-semibold text-zinc-600">
                            {currentRating ? `${currentRating} / 5 Stars` : 'Select rating'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block">
                          Write a Review
                        </label>
                        <textarea
                          rows="2"
                          value={reviews[prodId] || ''}
                          onChange={(e) => handleReviewChange(prodId, e.target.value)}
                          placeholder="What did you like or dislike about this campus item?"
                          className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-800 outline-none focus:border-[#003A8F] resize-none shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSubmitReview(item)}
                        className="rounded-full border-2 border-[#003A8F] bg-[#003A8F] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#002b6b] transition cursor-pointer shadow-md"
                      >
                        Submit Review
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {reviewedProducts.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-[#003A8F]/30 bg-white p-12 text-center shadow-2xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003A8F]/10 text-[#003A8F] mb-4">
                <HistoryOutlinedIcon fontSize="large" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">No review history yet</h2>
              <p className="mt-2 text-sm text-zinc-600">Products you have already rated and reviewed will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviewedProducts.map((item, index) => {
                const product = typeof item.product === 'object' ? item.product : {};

                return (
                  <article
                    key={`history-${index}`}
                    className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200">
                          <img
                            src={product?.images?.[0] || placeholderImage}
                            alt={product?.productName || 'Product'}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = placeholderImage;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 text-base">
                            {product?.productName || product?.title || 'Reviewed Product'}
                          </h3>
                          <p className="text-xs font-semibold text-[#003A8F] mt-0.5">
                            Reviewed on {new Date(item.reviewedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003A8F] border border-blue-100 uppercase tracking-wide">
                          Reviewed
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= item.rating ? 'text-[#FDB913]' : 'text-zinc-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-xs font-bold text-zinc-800">
                          {item.rating} / 5 Stars
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 italic">
                        "{item.reviewText}"
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default ReviewPage;