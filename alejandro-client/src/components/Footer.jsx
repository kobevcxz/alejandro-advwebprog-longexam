import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          
          <div>
            <h2 className="text-xl font-bold text-white">BulldogEx Shop</h2>
            <p className="mt-2 max-w-xs text-sm text-zinc-400">
              Your go-to campus shop for essentials. Fast, simple, and reliable ordering for students.
            </p>
          </div>

          <div className="flex gap-10">
            
            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-300">Shop</p>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li><Link to="/Products" className="hover:text-white">Products</Link></li>
                <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
                <li><Link to="/pickup" className="hover:text-white">Pickup</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-300">Support</p>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>

          </div>
        </div>

        <div className="my-6 border-t border-zinc-800"></div>

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} BulldogEx Shop. All rights reserved.</p>
          <p className="uppercase tracking-widest">
            Built for NU students
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;