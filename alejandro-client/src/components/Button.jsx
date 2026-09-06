import { Link } from 'react-router-dom';

const variantClasses = {
  primary: 'bg-[#003A8F] text-white hover:bg-[#002f73]',
  secondary: 'bg-[#FDB913] text-[#003A8F] hover:bg-[#e0a80f]',
};

const Button = ({
  children,
  to,
  type = 'button',
  variant = 'secondary',
  className = '',
  onClick,
}) => {
  const classes = [
    'inline-flex items-center justify-center rounded-full border-2 border-[#003A8F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition',
    variantClasses[variant] ?? variantClasses.secondary,
    className,
  ]
    .join(' ')
    .trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={(e) => {
        if (type === 'submit') {
          e.preventDefault();
        }
        if (onClick) onClick(e);
      }}
    >
      {children}
    </button>
  );
};

export default Button;