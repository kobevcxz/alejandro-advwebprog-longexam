import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders, cancelOrder } from '../../services/OrderService';
import Button from '../../components/Button';
import placeholderImage from '../../assets/img/placeholder-product.png';

const OrderPage = () => {
  const { user } = useAuth();

  const getUserId = () => {
    if (user) {
      if (typeof user === 'string') return user;
      if (user._id) return user._id;
      if (user.id) return user.id;
      if (user.userId) return user.userId;
    }
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (typeof parsed === 'string') return parsed;
        const found = parsed._id || parsed.id || parsed.userId || parsed.uid || parsed.user?._id || parsed.user?.id;
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
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!userId) return;
      try {
        const { data } = await fetchMyOrders(userId);
        setOrders(data.data || data || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load orders.'
        );
      }
    };

    loadOrders();
  }, [userId]);

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      const { data } = await fetchMyOrders(userId);
      setOrders(data.data || data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to cancel order.'
      );
    }
  };

  const userRole = (user?.role || user?.type || '').toLowerCase();
  if (!user || userRole === 'admin' || userRole === 'seller') {
    return (
      <section className="mx-auto max-w-xl my-16 border-2 border-[#003A8F] bg-white rounded-3xl p-8 text-center shadow-sm font-lexend">
        <h1 className="text-2xl font-bold text-zinc-900">
          Buyer Account Required
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Only designated buyer accounts have access to view orders.</p>
        <div className="mt-6 flex justify-center">
          <Button to="/">Back Home</Button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      {/* Header Section styled like Cart & Product pages */}
      <section className="border-y-2 border-[#003A8F] bg-white px-4 py-6 sm:px-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
          Order Tracking
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          My Orders
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Review your past checkouts, manage active requests, and track your purchase statuses.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#003A8F]/30 bg-white p-12 text-center shadow-2xs">
          <h2 className="text-xl font-bold text-zinc-900">You have no orders yet</h2>
          <p className="mt-2 text-sm text-zinc-600">Items you check out from your cart will appear here.</p>
          <div className="mt-6">
            <Button to="/products">Browse Products</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isDelivered = (order.orderStatus || '').toLowerCase() === 'delivered';
            const isPending = (order.orderStatus || '').toLowerCase() === 'pending';

            return (
              <article
                key={order._id}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-[#003A8F]/40 transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <p className="text-xs text-[#003A8F] font-semibold uppercase tracking-wider">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                      Ordered on {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003A8F] border border-blue-100 uppercase tracking-wide">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 text-xs sm:text-sm text-zinc-600 sm:grid-cols-2 rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
                  <p>
                    Payment method:{' '}
                    <span className="font-bold text-zinc-900">
                      {order.paymentMethod || 'Cash'}
                    </span>
                  </p>
                  <p className="sm:col-span-2">
                    Shipping Address:{' '}
                    <span className="font-bold text-zinc-900">
                      {order.shippingAddress}
                    </span>
                  </p>
                </div>

                <div className="mt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Products
                  </h3>

                  <div className="divide-y divide-zinc-100">
                    {order.products.map((item, idx) => {
                      const product = item.product || {};
                      const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

                      return (
                        <div
                          key={item._id || idx}
                          className="py-3 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200">
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
                              <p className="font-bold text-zinc-900 text-sm">
                                {product?.productName || product?.title || 'Unavailable product'}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Qty: {item.quantity} × PHP {Number(item.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <p className="font-bold text-zinc-900 text-sm">
                            PHP {itemTotal.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order._id)}
                        className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-100 transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                    {isDelivered && (
                      <Button to="/reviews" variant="secondary" className="text-xs">
                        Rate & Review Products
                      </Button>
                    )}
                  </div>

                  <p className="text-lg font-bold text-zinc-900">
                    Total Amount: <span className="text-[#003A8F]">PHP {Number(order.totalAmount || 0).toFixed(2)}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderPage;