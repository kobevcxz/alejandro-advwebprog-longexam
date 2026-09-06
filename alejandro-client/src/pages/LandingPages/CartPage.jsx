import { useEffect, useState } from 'react';
import Button from '../../components/Button.jsx';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
} from '../../services/CartService';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const CartPage = () => {
  const { user } = useAuth();
  
  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?._id) return user._id;

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) return parsed.id;
        if (parsed._id) return parsed._id;
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
      console.error('Error resolving user ID:', e);
    }
    return '';
  };

  const userId = getUserId();

  const [cart, setCart] = useState({
    products: [],
    totalPrice: 0.00,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [checkoutError, setCheckoutError] = useState('');

  const loadCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await fetchCart(userId);
      setCart(data?.data || { products: [], totalPrice: 0 });
    } catch (requestError) {
      console.error('Error loading cart:', requestError);
      setError('Unable to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  useEffect(() => {
    if (!useNewAddress) {
      setShippingAddress(user?.address || '');
    }
  }, [useNewAddress, user?.address]);

  const getProductId = (productObj, cartItem) => {
    if (productObj) {
      if (typeof productObj === 'string') return productObj;
      if (productObj._id) return productObj._id;
      if (productObj.id) return productObj.id;
    }
    if (cartItem?.product) {
      if (typeof cartItem.product === 'string') return cartItem.product;
      if (cartItem.product._id) return cartItem.product._id;
      if (cartItem.product.id) return cartItem.product.id;
    }
    return '';
  };

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;
    const productId = getProductId(item.product, item);
    if (!productId || !userId) return;

    try {
      setError('');
      const { data } = await updateCartQuantity(
        userId,
        productId,
        Number(quantity)
      );
      setCart(data?.data || cart);
      loadCart();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update quantity.'
      );
    }
  };

  const handleRemove = async (item) => {
    const productId = getProductId(item.product, item);
    if (!productId || !userId) return;

    try {
      const { data } = await removeFromCart(userId, productId);
      setCart(data?.data || cart);
      loadCart();
    } catch (requestError) {
      setError('Unable to remove product.');
    }
  };

  const handleCheckout = async () => {
    if (!userId) {
      setCheckoutError('User session ID not found. Please sign out and sign in again.');
      return;
    }

    if (!shippingAddress.trim()) {
      setCheckoutError('Please provide a valid shipping address.');
      return;
    }

    if (!cart.products || cart.products.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    try {
      setCheckoutError('');

      const formattedProducts = cart.products.map(item => {
        let prodId = '';
        if (typeof item.product === 'string') {
          prodId = item.product;
        } else if (item.product?._id) {
          prodId = item.product._id;
        } else if (item.product?.id) {
          prodId = item.product.id;
        }

        return {
          product: prodId,
          quantity: Number(item.quantity || 1),
          price: Number(item.product?.price || 0)
        };
      });

      const hasInvalidProduct = formattedProducts.some(p => !p.product);
      if (hasInvalidProduct) {
        setCheckoutError('One or more items have an invalid product ID reference.');
        return;
      }

      const payload = {
        buyer: userId,
        products: formattedProducts,
        totalAmount: Number(cart.totalPrice || 0),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
      };

      console.log("Submitting final checkout payload:", payload);

      const token = localStorage.getItem('token');
      // Directly call orders endpoint with auth headers
      await axios.post('http://localhost:8000/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/orders');
    } catch (requestError) {
      console.error('Full checkout error object:', requestError);
      
      const errorMessage = 
        requestError.response?.data?.message || 
        requestError.response?.data?.error || 
        requestError.message || 
        'Unable to complete checkout.';

      setCheckoutError(errorMessage);
    }
  };

  if (!user && !userId) {
    return (
      <section className="mx-auto max-w-xl my-16 border-2 border-[#003A8F] bg-white rounded-3xl p-8 text-center shadow-sm font-lexend">
        <h1 className="text-2xl font-bold text-zinc-900">
          Sign in required
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Please sign in to view your shopping cart and complete checkouts.</p>
        <div className="mt-6 flex justify-center">
          <Button to="/auth/signin">Sign In</Button>
        </div>
      </section>
    );
  }

  if (user && user.role && user.role !== 'buyer') {
    return (
      <section className="mx-auto max-w-xl my-16 border-2 border-[#003A8F] bg-white rounded-3xl p-8 text-center shadow-sm font-lexend">
        <h1 className="text-2xl font-bold text-zinc-900">
          Buyer Account Required
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Only designated buyer accounts have access to the shopping cart.</p>
        <div className="mt-6 flex justify-center">
          <Button to="/">Back Home</Button>
        </div>
      </section>
    );
  }

  if (loading) {
    return <p className="p-16 text-center font-lexend text-zinc-500 text-sm">Loading your cart items...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      <section className="border-y-2 border-[#003A8F] bg-white px-4 py-6 sm:px-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
          Shopping Cart
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Review Your Order
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your items, select your delivery address, and proceed with secure checkout.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {!cart.products || cart.products.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#003A8F]/30 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003A8F]/10 text-[#003A8F] mb-4">
            <ShoppingBagOutlinedIcon fontSize="large" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-zinc-600">Looks like you haven't added any campus essentials to your cart yet.</p>
          <div className="mt-6">
            <Button to="/products">Browse Products</Button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Cart Items ({cart.products.length})</h2>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#003A8F] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">BulldogEx Verified</span>
            </div>

            {cart.products.map((item) => {
              const product = item.product;
              const productPrice = Number(product?.price || 0);
              const itemTotal = productPrice * item.quantity;

              return (
                <article
                  key={item._id || item.id}
                  className="flex flex-col sm:flex-row items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-[#003A8F]/40 transition"
                >
                  <div className="h-28 w-full sm:h-24 sm:w-24 overflow-hidden rounded-2xl bg-zinc-100 shrink-0 border border-zinc-200">
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

                  <div className="flex flex-1 flex-col justify-between w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-zinc-900 text-base">
                          {product?.productName || 'Unavailable product'}
                        </h3>
                        <p className="text-xs font-semibold text-[#003A8F] mt-0.5">
                          PHP {productPrice.toFixed(2)} each
                        </p>
                      </div>
                      <p className="font-bold text-zinc-900 text-base">
                        PHP {itemTotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`quantity-${item._id}`}
                          className="text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                        >
                          Qty:
                        </label>
                        <input
                          id={`quantity-${item._id}`}
                          type="number"
                          min="1"
                          max={product?.stock || 99}
                          value={item.quantity}
                          onChange={(event) =>
                            handleQuantityChange(item, event.target.value)
                          }
                          className="w-16 rounded-xl border border-zinc-300 px-3 py-1 text-sm bg-zinc-50 font-semibold text-zinc-900 outline-none focus:border-[#003A8F] text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-100 transition cursor-pointer"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="lg:col-span-5 rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Complete your shipping and payment preferences.</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-[#FDB913]" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <LocalShippingOutlinedIcon fontSize="small" className="text-[#003A8F]" />
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Shipping Address
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUseNewAddress(false)}
                  className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold transition cursor-pointer text-center ${
                    !useNewAddress
                      ? 'border-[#003A8F] bg-[#003A8F] text-white shadow-xs'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  Registered Address
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUseNewAddress(true);
                    setShippingAddress('');
                  }}
                  className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold transition cursor-pointer text-center ${
                    useNewAddress
                      ? 'border-[#003A8F] bg-[#003A8F] text-white shadow-xs'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  New Address
                </button>
              </div>

              {!useNewAddress ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-xs font-medium text-zinc-700 leading-relaxed">
                  {user?.address ? (
                    <span>{user.address}</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">No registered address found in your account profile. Please switch to "New Address" to provide one.</span>
                  )}
                </div>
              ) : (
                <textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  rows="3"
                  required
                  placeholder="Enter complete building, street, or campus delivery address..."
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-800 outline-none focus:border-[#003A8F] resize-none shadow-2xs"
                />
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <PaymentOutlinedIcon fontSize="small" className="text-[#003A8F]" />
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Payment Method
                </label>
              </div>

              <div className="grid gap-2">
                {[
                  { id: 'Cash', label: 'Cash on Delivery', desc: 'Pay when items arrive' },
                  { id: 'GCash', label: 'GCash / E-Wallet', desc: 'Instant mobile transfer' },
                  { id: 'Card', label: 'Credit / Debit Card', desc: 'Secure online payment' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3 transition ${
                      paymentMethod === method.id
                        ? 'border-[#003A8F] bg-blue-50/30 shadow-2xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="h-4 w-4 accent-[#003A8F]"
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">{method.label}</span>
                        <span className="text-[11px] text-zinc-500">{method.desc}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span>PHP {Number(cart.totalPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                <span>Total Amount</span>
                <span className="text-[#003A8F]">PHP {Number(cart.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-semibold">
                {checkoutError}
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-full border-2 border-[#003A8F] bg-[#003A8F] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#002b6b] transition cursor-pointer shadow-md text-center relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Complete Checkout <span className="h-2 w-2 rounded-full bg-[#FDB913]" />
              </span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;