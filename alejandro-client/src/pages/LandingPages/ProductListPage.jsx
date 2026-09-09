import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../services/ProductService';
import placeholderImage from '../../assets/img/placeholder-product.png';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

const ProductListPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchProducts();
        const rawData = response?.data;
        const productArray = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.products || []);
        setProducts(Array.isArray(productArray) ? productArray : []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Unable to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <p className="p-16 text-center font-lexend text-zinc-500 text-sm">Loading products...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      {/* Header Section */}
      <section className="border-y-2 border-[#003A8F] bg-white px-4 py-6 sm:px-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
          Storefront
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Available Products
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Browse items, check details, and add campus essentials to your cart.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#003A8F]/30 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003A8F]/10 text-[#003A8F] mb-4">
            <StorefrontOutlinedIcon fontSize="large" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">No products available</h2>
          <p className="mt-2 text-sm text-zinc-600">Check back later for newly listed campus items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const productId = product._id || product.id;
            const imageUrl = product?.images?.[0] || placeholderImage;

            return (
              <article
                key={productId}
                className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-[#003A8F]/50 transition duration-300"
              >
                <div>
                  <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200">
                    <img
                      src={imageUrl}
                      alt={product?.productName || product?.name}
                      onError={(e) => { e.currentTarget.src = placeholderImage; }}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 line-clamp-1">
                    {product?.productName || product?.name}
                  </h3>

                  <p className="mt-1 font-bold text-[#003A8F]">
                    PHP {Number(product?.price || 0).toFixed(2)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="w-full rounded-full border-2 border-[#003A8F] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#003A8F] hover:bg-[#003A8F] hover:text-white transition cursor-pointer text-center"
                  >
                    View Product
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;