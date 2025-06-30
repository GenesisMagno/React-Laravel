import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct, useProducts } from "../../hooks/useProducts";
import { useAddToCart } from "../../hooks/useCart";
import ProductIngredientImage from "../../components/ProductIngredientImage";

export default function Viewproduct() {
    const { id } = useParams();
    const { data, isLoading, isError } = useProduct(id);
    const { data: productsData, isLoading: isProductsLoading } = useProducts(1, 12,'' );
    const addToCartMutation = useAddToCart();    
    const product = data?.product;
    const ingredients = data?.product.ingredients;

    const [selectedSize, setSelectedSize] = useState("tub");
    const [productPrice, setProductPrice] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    // Slider state for ingredients
    const [currentSlide, setCurrentSlide] = useState(0);
    const itemsPerSlide = 4;
    const totalSlides = Math.ceil(ingredients?.length / itemsPerSlide);

    // Slider state for "You may also like" products
    const [currentProductSlide, setCurrentProductSlide] = useState(0);
    const productsPerSlide = 4;
    
    // Filter out current product from suggestions and get total slides
    const suggestedProducts = productsData?.data?.filter(p => p.id !== parseInt(id)) || [];
    const totalProductSlides = Math.ceil(suggestedProducts.length / productsPerSlide);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const nextProductSlide = () => {
        setCurrentProductSlide((prev) => (prev + 1) % totalProductSlides);
    };

    const prevProductSlide = () => {
        setCurrentProductSlide((prev) => (prev - 1 + totalProductSlides) % totalProductSlides);
    };

    // Handle updates to product, size, quantity
    useEffect(() => {
        if (product && product[selectedSize]) {
            setProductPrice(product[selectedSize]);
            setTotalPrice(product[selectedSize] * quantity);
        }
    }, [product, selectedSize, quantity]);

    const handleAddToCart = () => {
        if (!product || !selectedSize || quantity < 1) {
            alert('Please select a valid size and quantity');
            return;
        }

        const cartItem = {
            product_id: parseInt(id),
            product_image: product.image,
            product_price: productPrice.toString(), 
            size: selectedSize,
            quantity: quantity
        };

        addToCartMutation.mutate(cartItem, {
            onSuccess: () => {
                alert('Added to cart successfully!');
            },
            onError: (error) => {
                console.error('Error adding to cart:', error);
                alert('Failed to add to cart. Please try again.');
            }
        });
    };

    const getProductPrice = (product) => {
        // Return the first available price from the product
        return product.big || product.medium || product.platter || product.tub || 0;
    };

    if (isLoading) return <></>;
    if (isError || !product) return <p className="text-center text-lg text-red-500">Product not found.</p>;

    return (
        <div className="w-full h-auto py-10">
            <div className="w-full flex justify-center m-auto h-[70vh] items-center bg-white rounded shadow-sm mb-8">
                <div className="h-full w-[50%] flex">
                    <img
                        src={`http://localhost:8000/storage/${product.image}`}
                        alt={product.name}
                        className="w-full aspect-[4/3] m-auto object-fill rounded-lg"
                    />
                </div>
                <div className="h-4/5 w-[40%] justify-center items-center text-center flex flex-col gap-y-5" >
                    <p className="text-4xl  font-bold">{product.name}</p>
                    <p className="text-2xl font-semibold">₱{productPrice}</p>

                    <ul className="flex flex-wrap gap-3">
                        {["big", "medium", "platter", "tub"].map((size) => (
                            <li key={size}>
                                <button
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        product[size] == null
                                            ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
                                            : productPrice === product[size]
                                            ? "bg-green-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                                    }`}
                                    disabled={product[size] == null}
                                >
                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-center items-center">
                        <div className="mr-2 font-medium">Quantity</div>

                        <button
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-l-md"
                        >
                            <i className="fa-solid fa-minus text-sm"></i>
                        </button>

                        <div className="w-10 h-8 flex items-center justify-center bg-gray-100 text-lg">
                            {quantity}
                        </div>

                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-r-md"
                        >
                            <i className="fa-solid fa-plus text-sm"></i>
                        </button>
                    </div>

                    <p className="text-lg font-semibold ">
                        Total: ₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>

                    <div className="flex flex-col w-full items-center">
                        <Link to="/order" className="bg-green-700 text-white  py-3 mb-2 text-center text-xl w-[40%] hover:bg-green-800 rounded font-medium">
                            Order Now
                        </Link>

                        <button 
                            onClick={handleAddToCart}
                            disabled={addToCartMutation.isLoading || !product[selectedSize]}
                            className={`border border-green-700 bg-green-50 text-green-700 py-3 text-center text-xl w-[40%] hover:bg-green-100 rounded font-medium
                                ${addToCartMutation.isLoading || !product[selectedSize] 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : ''
                                }`}
                        >
                            <span className="fa fa-shopping-cart text-xl mr-3 "> </span>
                            {addToCartMutation.isLoading ? 'Adding...' : 'Add To Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Ingredients Section */}
            {ingredients && ingredients.length > 0 && (
                <div className="w-full bg-white rounded shadow-sm mb-8 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Main Ingredients</h2>
                        <p className="text-gray-600">Fresh, quality ingredients that make our {product.name} special</p>
                    </div>
                    
                    <div className="relative">
                        {/* Slider Container */}
                        <div className="overflow-hidden">
                            <div 
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                                    <div key={slideIndex} className="w-full flex-shrink-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {ingredients
                                                .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                                                .map((ingredient) => (
                                                    <div key={ingredient.id} className="text-center group">
                                                        <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 h-32 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300">
                                                            <img 
                                                                src={`http://localhost:8000/storage/${ingredient.image}`} 
                                                                alt={ingredient.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{ingredient.name}</h3>
                                                        <p className="text-sm text-gray-600">{ingredient.description}</p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Arrows - Only show if more than 4 ingredients */}
                        {ingredients.length > itemsPerSlide && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 z-10"
                                >
                                    <i className="fa-solid fa-chevron-left text-gray-600"></i>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 z-10"
                                >
                                    <i className="fa-solid fa-chevron-right text-gray-600"></i>
                                </button>
                            </>
                        )}

                        {/* Slide Indicators - Only show if more than 4 ingredients */}
                        {ingredients.length > itemsPerSlide && (
                            <div className="flex justify-center mt-6 space-x-2">
                                {Array.from({ length: totalSlides }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                            index === currentSlide 
                                                ? 'bg-green-800' 
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* You May Also Like Section */}
            {!isProductsLoading && suggestedProducts.length > 0 && (
                <div className="w-full bg-white rounded shadow-sm mb-8 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">You May Also Like</h2>
                        <p className="text-gray-600">Discover more delicious options from our menu</p>
                    </div>
                    
                    <div className="relative">
                        {/* Product Slider Container */}
                        <div className="overflow-hidden">
                            <div 
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentProductSlide * 100}%)` }}
                            >
                                {Array.from({ length: totalProductSlides }).map((_, slideIndex) => (
                                    <div key={slideIndex} className="w-full flex-shrink-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {suggestedProducts
                                                .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                                                .map((suggestedProduct) => (
                                                    <Link 
                                                        key={suggestedProduct.id} 
                                                        to={`/product/${suggestedProduct.id}`}
                                                        className="group block"
                                                    >
                                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                                <img 
                                                                    src={`http://localhost:8000/storage/${suggestedProduct.image}`} 
                                                                    alt={suggestedProduct.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                            <div className="p-4">
                                                                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                                                                    {suggestedProduct.name}
                                                                </h3>
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-xl font-bold text-green-600">
                                                                        ₱{getProductPrice(suggestedProduct).toLocaleString()}
                                                                    </p>
                                                                    <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">
                                                                        View Details →
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Arrows - Only show if more than 4 products */}
                        {suggestedProducts.length > productsPerSlide && (
                            <>
                                <button
                                    onClick={prevProductSlide}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 z-10"
                                >
                                    <i className="fa-solid fa-chevron-left text-gray-600"></i>
                                </button>
                                <button
                                    onClick={nextProductSlide}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 z-10"
                                >
                                    <i className="fa-solid fa-chevron-right text-gray-600"></i>
                                </button>
                            </>
                        )}

                        {/* Slide Indicators - Only show if more than 4 products */}
                        {suggestedProducts.length > productsPerSlide && (
                            <div className="flex justify-center mt-6 space-x-2">
                                {Array.from({ length: totalProductSlides }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentProductSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                            index === currentProductSlide 
                                                ? 'bg-green-800' 
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}