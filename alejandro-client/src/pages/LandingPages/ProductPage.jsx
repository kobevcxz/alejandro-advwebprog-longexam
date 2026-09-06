import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { useAuth } from '../../context/AuthContext';
import { fetchProductById } from '../../services/ProductService';
import { fetchProductReviews } from '../../services/ReviewService';
import { addToCart } from '../../services/CartService';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

function ProductPage() {
  const { name: productId } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Bulletproof user ID resolver that decodes straight from the JWT token if needed
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await fetchProductById(productId);
        setProduct(data.data || data);
      } catch (requestError) {
        console.error('Error fetching product:', requestError);
        setError('Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    const loadReviews = async () => {
      try {
        setReviewError('');
        const { data } = await fetchProductReviews(productId);
        setReviews(data.data || data || []);
      } catch (requestError) {
        console.error(
          'Error fetching reviews:',
          requestError.response?.data || requestError.message
        );
        setReviewError('Unable to load reviews.');
      }
    };

    if (productId) {
      loadProduct();
      loadReviews();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    const userId = getUserId();
    if (!userId) {
      setCartMessage('Please sign in to add items to your cart.');
      return;
    }

    try {
      await addToCart(userId, productId, 1);
      setCartMessage('Added to cart successfully!');
    } catch (requestError) {
      console.error('Add to cart error:', requestError);
      setCartMessage(
        requestError.response?.data?.message ||
          'Unable to add product to cart.'
      );
    }
  };

  if (loading) {
    return <p className="p-16 text-center font-lexend text-zinc-500 text-sm">Loading product details...</p>;
  }

  if (error || !product) {
    return (
      <section className="mx-auto max-w-xl my-16 border-2 border-[#003A8F] bg-white rounded-3xl p-8 text-center shadow-sm font-lexend">
        <h1 className="text-2xl font-bold text-zinc-900">
          {error || 'Product not found'}
        </h1>
        <div className="mt-6 flex justify-center">
          <Button to="/products">Back to Products</Button>
        </div>
      </section>
    );
  }

  const image = product.images?.[0] || product.image || placeholderImage;
  const formattedPrice = Number(product.price || 0).toFixed(2);
  const category =
    typeof product.category === 'object' && product.category !== null
      ? product.category.categoryName || product.category.name
      : (product.category || 'Uncategorized');

  const seller =
    typeof product.seller === 'object'
      ? product.seller
      : null;

  const sellerName = seller
    ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim()
    : 'Unknown seller';

  const inStock = (product.stock ?? product.quantity ?? 0) > 0;

  return (
    <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      {/* Top Banner / Breadcrumb Section */}
      <section className="border-y-2 border-[#003A8F] bg-white px-4 py-6 sm:px-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl">
          <Button to="/products">Back to Products</Button>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {category}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            {product.productName || product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-2xl font-bold text-[#003A8F]">
              PHP {formattedPrice}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {inStock ? `${product.stock ?? product.quantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </section>

      {/* Product Display & Details Section */}
      <section className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Image */}
        <div className="lg:col-span-6 rounded-3xl border-2 border-[#003A8F] bg-white p-6 shadow-sm">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 relative">
            <img
              src={image}
              alt={product.productName || product.title}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = placeholderImage;
              }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Right: Description & Add to Cart Action */}
        <div className="lg:col-span-6 rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Product Description</h2>
            <p className="text-sm leading-7 text-zinc-700 whitespace-pre-wrap">
              {product.description || product.content?.[0] || 'No description available for this item.'}
            </p>
          </div>

          <div className="border-t border-zinc-100 pt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center gap-2 rounded-full border-2 border-[#003A8F] bg-[#003A8F] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#002b6b] transition cursor-pointer shadow-md"
              >
                <ShoppingBagOutlinedIcon fontSize="small" />
                Add to Cart
              </button>
              <Button to="/products" variant="primary">Back to Catalog</Button>
            </div>

            {cartMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${cartMessage.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-[#003A8F] border border-blue-200'}`}>
                {cartMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-4">
          Customer Reviews
        </h2>

        {reviewError && (
          <p className="mt-4 text-sm text-red-600 font-semibold">
            {reviewError}
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No reviews yet for this product.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 mt-4">
            {reviews.map((review) => (
              <article key={review._id || review.id} className="py-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-zinc-900">
                    {review.reviewer?.firstName || 'User'} {review.reviewer?.lastName || ''}
                  </p>
                  <div className="flex items-center gap-1 bg-[#FDB913]/20 px-2.5 py-0.5 rounded-full text-xs font-bold text-zinc-900">
                    <StarRateRoundedIcon fontSize="small" className="text-[#FDB913]" />
                    {review.rating}/5
                  </div>
                </div>
                <p className="text-sm text-zinc-600">{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Seller Information Section */}
      <section className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#003A8F]/10 text-[#003A8F] border border-blue-100">
          <PersonOutlineOutlinedIcon fontSize="medium" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
            Verified Seller
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-0.5">
            {sellerName}
          </h2>
          {seller?.email && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {seller.email}
            </p>
          )}
        </div>
      </section>

    </div>
  );
}

export default ProductPage;