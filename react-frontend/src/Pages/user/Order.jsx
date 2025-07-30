import { useState, useEffect } from "react";
import { useCart } from "../../hooks/useCart";
import { usePlaceOrderFromCart, useQuickOrder } from "../../hooks/useOrder";
import { useUser } from "../../hooks/useAuth";


export default function OrderPage() {
    const { data: user } = useUser();
    const { data: cartData } = useCart();
    const placeOrderFromCartMutation = usePlaceOrderFromCart();

    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        street_address: '',
        city: '',
        zip_code: '',
        delivery_date: '',
        payment_method: 'cash',
        instructions: '',
        delivery_option: 'delivery'
    });

    const [isLoading, setIsLoading] = useState(false);

    // Pre-fill form with user data if available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                phone: user.phone || '',
                street_address: user.street_address || '',
                city: user.city || '',
                zip_code: user.zip_code || ''
            }));
        }
    }, [user]);

    const cartItems = cartData?.items || [];
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
    const deliveryFee = formData.delivery_option === 'delivery' ? 50 : 0;
    const total = subtotal + deliveryFee;

    // Get tomorrow's date as minimum selectable date
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Get max date (30 days from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const required = ['email', 'phone', 'delivery_date', 'payment_method'];
        
        if (formData.delivery_option === 'delivery') {
            required.push('street_address', 'city');
        }

        for (const field of required) {
            if (!formData[field] || formData[field].trim() === '') {
                alert(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty. Please add items to your cart first.');
            return false;
        }

        return true;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const orderData = {
                email: formData.email,
                phone: formData.phone,
                street_address: formData.street_address,
                city: formData.city,
                zip_code: formData.zip_code,
                delivery_date: formData.delivery_date,
                payment_method: formData.payment_method,
                instructions: formData.instructions
            };

            const result = await placeOrderFromCartMutation.mutateAsync(orderData);
            
            alert('Order placed successfully!');
            navigate('/orders', { 
                state: { 
                    message: 'Order placed successfully!', 
                    orderId: result.order?.id 
                } 
            });
        } catch (error) {
            console.error('Order submission error:', error);
            alert(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="w-full min-h-screen bg-gray-50 py-8 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
                    <p className="text-gray-600 mb-4">You need to be logged in to place an order.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="w-full min-h-screen bg-gray-50 py-8 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-4">Add some delicious items to your cart first.</p>
                    <button 
                        onClick={() => navigate('/products')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Your Order</h1>
                    <p className="text-gray-600">Fill in your details and confirm your delicious order</p>
                </div>

                <div onSubmit={handleSubmitOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Form */}
                        <div className="lg:col-span-2">
                            <div className="space-y-6">
                                {/* Delivery Options */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delivery Options</h2>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery_option"
                                                value="delivery"
                                                checked={formData.delivery_option === 'delivery'}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                            />
                                            <span className="ml-2 text-lg font-medium">Delivery (+₱50)</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery_option"
                                                value="pickup"
                                                checked={formData.delivery_option === 'pickup'}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                            />
                                            <span className="ml-2 text-lg font-medium">Pickup</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder="+63 912 345 6789"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address (only show if delivery is selected) */}
                                {formData.delivery_option === 'delivery' && (
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delivery Address</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Street Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="street_address"
                                                    required={formData.delivery_option === 'delivery'}
                                                    value={formData.street_address}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                    placeholder="123 Main Street, Barangay Name"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        required={formData.delivery_option === 'delivery'}
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                        placeholder="Imus"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        ZIP Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zip_code"
                                                        value={formData.zip_code}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                        placeholder="4103"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery/Pickup Date */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                        {formData.delivery_option === 'delivery' ? 'Delivery' : 'Pickup'} Date
                                    </h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred {formData.delivery_option === 'delivery' ? 'Delivery' : 'Pickup'} Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="delivery_date"
                                            required
                                            value={formData.delivery_date}
                                            onChange={handleInputChange}
                                            min={getTomorrowDate()}
                                            max={getMaxDate()}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Orders must be placed at least 1 day in advance
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                                    <div className="space-y-3">
                                        <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="cash"
                                                checked={formData.payment_method === 'cash'}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                            />
                                            <span className="ml-3 text-lg font-medium">
                                                Cash on {formData.delivery_option === 'delivery' ? 'Delivery' : 'Pickup'}
                                            </span>
                                        </label>
                                        <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="gcash"
                                                checked={formData.payment_method === 'gcash'}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                            />
                                            <span className="ml-3 text-lg font-medium">GCash</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Special Instructions</h2>
                                    <textarea
                                        name="instructions"
                                        value={formData.instructions}
                                        onChange={handleInputChange}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                                        placeholder="Any special requests or instructions for your order..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.instructions.length}/500 characters
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                                
                                {/* Cart Items */}
                                <div className="space-y-4 mb-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <img
                                                src={item.product_image || '/api/placeholder/64/64'}
                                                alt={item.product?.name || 'Product'}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                                                    {item.product?.name || 'Unknown Product'}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Size: {item.size?.charAt(0).toUpperCase() + item.size?.slice(1)}
                                                </p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                                    <span className="font-semibold text-green-600">
                                                        ₱{(item.product_price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₱{subtotal.toLocaleString()}</span>
                                    </div>
                                    {formData.delivery_option === 'delivery' && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Delivery Fee</span>
                                            <span>₱{deliveryFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-2">
                                        <div className="flex justify-between text-lg font-bold text-gray-800">
                                            <span>Total</span>
                                            <span className="text-green-600">₱{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isLoading || placeOrderFromCartMutation.isLoading}
                                    className="w-full bg-green-700 text-white py-4 mt-6 text-center text-xl hover:bg-green-800 rounded-lg font-medium transition-colors duration-200 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading || placeOrderFromCartMutation.isLoading ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check mr-2"></i>
                                            Place Order
                                        </>
                                    )}
                                </button>

                                {/* Security Note */}
                                <p className="text-xs text-gray-500 text-center mt-4">
                                    <i className="fa-solid fa-lock mr-1"></i>
                                    Your information is secure and protected
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}