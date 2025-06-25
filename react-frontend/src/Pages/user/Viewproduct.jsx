import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../hooks/useProducts";
import { useAddToCart, useUpdateQuantity } from "../../hooks/useCart";
import ProductIngredientImage from "../../components/ProductIngredientImage";

export default function Viewproduct() {
    const { id } = useParams();
    const { data, isLoading, isError } = useProduct(id);
    const addToCartMutation = useAddToCart();    
    const product = data?.product;

    const [selectedSize, setSelectedSize] = useState("tub");
    const [productPrice, setProductPrice] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    // Sample ingredients data - you can modify this or fetch from your API
    const ingredients = [
        {
            id: 1,
            name: "Mt. fuji",
            image: "mango.jpg", // Replace with actual image paths
            description: "Sweet, ripe mangoes sourced locally"
        },
        {
            id: 2,
            name: "Glutinous Rice",
            image: "glutinous-rice.jpg",
            description: "Premium quality sticky rice"
        },
        {
            id: 3,
            name: "Coconut Milk",
            image: "coconut-milk.jpg",
            description: "Rich, creamy coconut milk"
        },
        {
            id: 4,
            name: "Brown Sugar",
            image: "brown-sugar.jpg",
            description: "Natural brown sugar for sweetness"
        },
        {
            id: 5,
            name: "Sea Salt",
            image: "sea-salt.jpg",
            description: "Pure sea salt for enhanced flavor"
        },
        {
            id: 6,
            name: "Vanilla Extract",
            image: "vanilla.jpg",
            description: "Natural vanilla for aromatic sweetness"
        }
    ];

    // Slider state for ingredients
    const [currentSlide, setCurrentSlide] = useState(0);
    const itemsPerSlide = 4;
    const totalSlides = Math.ceil(ingredients.length / itemsPerSlide);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const getCurrentSlideItems = () => {
        const startIndex = currentSlide * itemsPerSlide;
        return ingredients.slice(startIndex, startIndex + itemsPerSlide);
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

    if (isLoading) return <></>;
    if (isError || !product) return <p className="text-center text-lg text-red-500">Product not found.</p>;

    return (
        <div className="w-full h-auto py-10">
            <div className="w-full flex justify-center m-auto h-[70vh] items-center bg-white rounded shadow-sm mb-8">
                <div className="h-[4/5] w-[50%] flex">
                    <img
                        src={`http://localhost:8000/storage/${product.image}`}
                        alt={product.name}
                        className="w-full aspect-[4/3] m-auto object-fill rounded-lg"
                    />
                </div>
                <div className="h-3/5 w-[40%] justify-center items-center text-center flex flex-col" >
                    <p className="text-4xl m-auto mb-3 pt-10 font-bold">{product.name}</p>
                    <p className="text-xl m-auto font-semibold">₱{productPrice}</p>

                    <ul className="flex flex-wrap justify-center gap-3 my-7">
                        {["big", "medium", "platter", "tub"].map((size) => (
                            <li key={size}>
                                <button
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                                        ${
                                            product[size] == null
                                                ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
                                                : productPrice === product[size]
                                                ? "bg-gray-300 text-black"
                                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                        }`}
                                    disabled={product[size] == null}
                                >
                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-center items-center mb-9">
                        <div className="mr-2 font-medium">Quantity</div>

                        <button
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                            className="w-6 h-8 flex items-center justify-center bg-gray-300"
                        >
                            <i className="fa-solid fa-minus text-sm"></i>
                        </button>

                        <div className="w-10 h-8 flex items-center justify-center bg-gray-200 text-lg">
                            {quantity}
                        </div>

                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-6 h-8 flex items-center justify-center bg-gray-300"
                        >
                            <i className="fa-solid fa-plus text-sm"></i>
                        </button>
                    </div>

                    <p className="text-lg font-semibold mb-6">
                        Total: ₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>

                    <Link to="/order" className="bg-green-800 text-white px-14 py-3 mt-4 text-center text-xl w-[50%] hover:bg-green-700 rounded font-medium">
                        Order Now
                    </Link>

                    <button 
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isLoading || !product[selectedSize]}
                        className={`border border-green-700 bg-green-50 text-green-700 px-14 py-3 mt-4 text-center text-xl w-[50%] hover:bg-green-100 rounded font-medium
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

            {/* Ingredients Section */}
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
                                                        <ProductIngredientImage keyword={ingredient.name} />
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

            <div className="w-full">
                <div className="text-md text-gray-500 font-medium mb-8">YOU MAY ALSO LIKE </div>
            </div>
        </div>
        
    );
}