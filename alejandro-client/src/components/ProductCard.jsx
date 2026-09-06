import Button from './Button';
import placeholderImage from '../assets/img/placeholder-product.png';

const ProductCard = ({ product, index }) => {
  const numericPrice = Number(product.price);

  const formattedPrice = Number.isFinite(numericPrice)
    ? `PHP ${numericPrice.toFixed(2)}`
    : 'Price unavailable';

  const productId = product.id || product._id;

  return (
    <article className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4 flex flex-col">
      <div className="overflow-hidden rounded-[1.25rem]">
        <img 
            src={product.image || product.images?.[0]} 
            alt={product.title || product.productName} 
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = placeholderImage;
          }}
          className="aspect-[4/3] w-full object-cover" 
        />
      </div>
      
      <p className="mt-4 text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {typeof product.category === 'object' ? product.category?.categoryName : product.category}
      </p>

      <h3 className="mt-2 text-lg font-lexend font-semibold text-zinc-900">
        {product.title || product.productName}
      </h3>

      <p className="mt-2 text-base font-lexend font-bold text-zinc-900">
        {formattedPrice}
      </p>

      <p className="mt-3 text-sm leading-6 font-lexend text-zinc-600">
        {(product.content?.[0] || product.description || '').substring(0, 120)}...
      </p>

      <div className="mt-auto pt-4">
        <Button to={`/products/${productId}`}>
          View Product
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;