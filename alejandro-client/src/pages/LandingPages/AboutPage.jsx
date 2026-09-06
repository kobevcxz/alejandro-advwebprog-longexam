import Button from '../../components/Button.jsx';
import banner from '../../assets/img/nu_bulldogex_banner.jpg';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const AboutPage = () => {
  return (
    <div className="flex w-full flex-col gap-6 font-lexend pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      {/* Hero Banner Section */}
      <section className="relative min-h-[26rem] overflow-hidden rounded-3xl border-2 border-[#003A8F] bg-zinc-900 px-6 py-12 sm:px-10 shadow-sm flex items-center">
        <img
          src={banner}
          alt="BulldogEx Banner"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />

        <div className="relative z-10 flex max-w-xl flex-col justify-center min-h-[16rem]">
          <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FDB913] bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 w-fit">
            About BulldogEx
          </span>
          <h1 className="text-3xl font-bold text-white sm:text-4xl leading-tight">
            The Official Campus Marketplace
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-200">
            BulldogEx is designed to connect students with official university merchandise, uniforms, and daily student essentials quickly and securely.
          </p>
          <div className="mt-6 flex gap-3">
            <Button to="/products">
              Explore Products
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#003A8F]/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
            Our Mission
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900">
            Streamlining campus commerce
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            To provide a seamless, centralized platform where students can easily acquire academic requirements, school apparel, and peer-to-peer essentials without hassle.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDB913]/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
            Our Vision
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900">
            A connected student community
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            Building a trusted digital marketplace tailored specifically for campus life, empowering student entrepreneurs and buyers with reliable order tracking and secure transactions.
          </p>
        </div>
      </section>

      {/* Features Overview */}
      <section className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">
            Platform Highlights
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900">
            Why choose BulldogEx?
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { 
              title: 'Role-Based Access', 
              desc: 'Tailored interfaces for buyers, verified sellers, and administrators.',
              icon: <SchoolOutlinedIcon className="text-[#003A8F]" />
            },
            { 
              title: 'Secure Checkout', 
              desc: 'Flexible payment methods including Cash on Delivery, GCash, and Card.',
              icon: <VerifiedOutlinedIcon className="text-[#003A8F]" />
            },
            { 
              title: 'Real-Time Tracking', 
              desc: 'Monitor your order statuses seamlessly from placement to fulfillment.',
              icon: <LocalShippingOutlinedIcon className="text-[#003A8F]" />
            },
          ].map((feature, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-2xs flex flex-col justify-between hover:border-[#003A8F]/40 transition">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-900">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;