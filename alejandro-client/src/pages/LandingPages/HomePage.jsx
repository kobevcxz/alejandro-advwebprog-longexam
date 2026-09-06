import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import banner from '../../assets/img/nu_bulldogex_banner.jpg';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { fetchProducts } from '../../services/ProductService';
import { fetchAllOrders } from '../../services/OrderService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
    });

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const [productResponse, orderResponse] = await Promise.all([
                    fetchProducts({ limit: 100 }),
                    fetchAllOrders({ limit: 1 }),
                ]);

                const productData = productResponse?.data?.data || [];
                setFeaturedProducts(productData.slice(0, 4));

                // Calculate unique categories count from products list
                const uniqueCategories = new Set(
                    productData.map((p) => 
                        typeof p.category === 'object' && p.category !== null 
                            ? (p.category?.categoryName || p.category?.name) 
                            : p.category
                    ).filter(Boolean)
                );

                setStats({
                    products: productResponse?.data?.pagination?.total ?? productData.length,
                    categories: uniqueCategories.size,
                    orders: orderResponse?.data?.pagination?.total ?? 0,
                });
            } catch (requestError) {
                console.error('Error fetching home data:', requestError);
            }
        };

        loadHomeData();
    }, []);

    const formatNum = (num) => String(num).padStart(2, '0');

    return (
        <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
            
            {/* Hero Banner Section */}
            <section className="relative min-h-[30rem] overflow-hidden rounded-3xl border-2 border-[#003A8F] bg-zinc-900 px-4 py-12 sm:px-8 lg:px-12 shadow-sm flex items-center">
                <img
                    src={banner}
                    alt="BulldogEx Banner"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />

                <div className="relative z-10 max-w-xl text-left">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FDB913]">
                        Official Student Marketplace
                    </p>
                    <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
                        Welcome to BulldogEx Shop
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
                        Explore campus apparel, custom stickers, school supplies, and student merch all in one lightning-fast storefront.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Button to="/products">
                            Shop All Products
                        </Button>
                        <Button to="/about" variant="primary">
                            About Our Store
                        </Button>
                    </div>
                </div>
            </section>

            {/* Value Proposition Badges */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xs">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#003A8F] border border-blue-100">
                        <LocalShippingOutlinedIcon />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-sm">Fast Campus Dispatch</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Reliable delivery right to your dormitory or address.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xs">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#FDB913] border border-amber-100">
                        <VerifiedUserOutlinedIcon />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-sm">BulldogEx Verified</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Authorized merchandise built for NU students.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xs">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <SecurityOutlinedIcon />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-sm">Secure Payments</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Supports Cash, GCash, and Card transactions.</p>
                    </div>
                </div>
            </section>

            {/* Store Overview Stats Section */}
            <section className="border-y-2 border-[#003A8F] bg-white px-6 py-8 rounded-3xl shadow-2xs">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
                            Store Overview
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-zinc-900">Live platform metrics</h2>
                    </div>
                    <span className="text-xs text-zinc-400">Updated in real-time from database</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border-2 border-[#003A8F] bg-[#003A8F] p-6 text-white shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-[#FDB913]">{formatNum(stats.products)}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-200">
                                Available Products
                            </p>
                        </div>
                        <ShoppingBagOutlinedIcon fontSize="large" className="text-[#FDB913]/30" />
                    </div>
                    <div className="rounded-2xl border-2 border-[#003A8F] bg-[#003A8F] p-6 text-white shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-[#FDB913]">{formatNum(stats.categories)}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-200">
                                Product Categories
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-[#FDB913]/20 flex items-center justify-center text-[#FDB913] font-bold">#</div>
                    </div>
                    <div className="rounded-2xl border-2 border-[#003A8F] bg-[#003A8F] p-6 text-white shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-[#FDB913]">{formatNum(stats.orders)}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-200">
                                Completed Orders
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">✓</div>
                    </div>
                </div>
            </section>

            {/* Featured / Trending Products Section */}
            {featuredProducts.length > 0 && (
                <section className="border-y-2 border-[#003A8F] bg-white px-6 py-8 rounded-3xl shadow-2xs space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
                                Spotlight
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-zinc-900">Featured campus items</h2>
                        </div>
                        <Button to="/products" variant="secondary" className="text-xs">
                            Browse Catalog
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => {
                            const imgUrl = product.images?.[0] || product.image || placeholderImage;
                            const price = Number(product.price || 0);

                            return (
                                <div 
                                    key={product._id || product.id}
                                    onClick={() => navigate('/products')}
                                    className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-[#003A8F] transition flex flex-col justify-between group cursor-pointer"
                                >
                                    <div>
                                        <div className="h-44 w-full overflow-hidden rounded-2xl bg-zinc-100 relative border border-zinc-200">
                                            <img
                                                src={imgUrl}
                                                alt={product.productName}
                                                onError={(e) => { e.target.src = placeholderImage; }}
                                                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            {product.stock <= 0 && (
                                                <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                                    Sold Out
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-zinc-900 text-sm mt-3 truncate group-hover:text-[#003A8F] transition">
                                            {product.productName}
                                        </h3>
                                        <p className="text-xs font-semibold text-[#003A8F] mt-1">
                                            PHP {price.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-500">
                                        <span>View in catalog</span>
                                        <span className="text-[#003A8F]">→</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

        </div>
    );
};

export default HomePage;