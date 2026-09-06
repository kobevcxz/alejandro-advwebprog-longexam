import { Outlet, useLocation } from 'react-router-dom';
import signInImage from '../assets/img/signInn.jpg';
import signUpImage from '../assets/img/idk.jpg';

const AuthLayout = () => {
  const location = useLocation();

  const image = location.pathname.includes('signup')
    ? signUpImage
    : signInImage;

  return (
    <section className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="grid min-h-screen w-full lg:grid-cols-[1fr_0.95fr]">

        <div className="flex items-center justify-center border-b border-[#003A8F] bg-[#003A8F] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:border-[#003A8F] lg:p-16">
          <div className="w-full max-w-md">
            <img
              src={image}
              alt="Auth Visual"
              className="w-full h-auto rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>

        <main className="flex items-center bg-zinc-50 px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>
        </main>

      </div>
    </section>
  );
};

export default AuthLayout;