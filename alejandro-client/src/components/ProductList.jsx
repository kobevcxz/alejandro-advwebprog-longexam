import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.name} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductList;