import { useState, useEffect } from 'react';
import { useCart, useRemoveFromCart, useUpdateQuantity, useUpdateSelection } from '../../hooks/useCart';
import { Link } from 'react-router-dom';

export default function Cart(){
  const { data: cartData, isLoading, error } = useCart();
  const removeFromCartMutation = useRemoveFromCart();
  const updateQuantityMutation = useUpdateQuantity();
  const updateSelectionMutation = useUpdateSelection();

  const [selectedItems, setSelectedItems] = useState(new Set());

  const cartItems = cartData?.items || [];

  // Sync local state with backend data when cart data changes
  useEffect(() => {
    if (cartItems.length > 0) {
      const selectedFromBackend = new Set(
        cartItems.filter(item => item.selected).map(item => item.id)
      );
      setSelectedItems(selectedFromBackend);
    }
  }, [cartItems]);

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity < 1) return;
    
    updateQuantityMutation.mutate({
      product_id: productId,
      size: size,
      quantity: newQuantity
    });
  };

  const handleRemoveItem = (productId, size) => {
    removeFromCartMutation.mutate({ product_id: productId, size });
  };

  const handleSelectItem = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    const newSelected = !selectedItems.has(itemId);
    
    // Update backend
    updateSelectionMutation.mutate({
      cartItemId: itemId,
      selected: newSelected
    });

    // Update local state immediately for better UX
    const newSelectedItems = new Set(selectedItems);
    if (newSelected) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    const shouldSelectAll = selectedItems.size !== cartItems.length;
    
    // Update all items in backend
    cartItems.forEach(item => {
      updateSelectionMutation.mutate({
        cartItemId: item.id,
        selected: shouldSelectAll
      });
    });

    // Update local state
    if (shouldSelectAll) {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteSelected = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    selectedCartItems.forEach(item => {
      handleRemoveItem(item.product_id, item.size);
    });
    setSelectedItems(new Set());
  };

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toLocaleString()}`;
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  const totalSelectedItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSelectedPrice = selectedCartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

  return (
    <div className="w-full mx-auto max-w-full py-16 bg-gray-50 h-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="flex items-center p-4 border-b border-b-gray-300 h-16">
          <span className="text-green-600 font-medium mr-4">Shopping Cart</span>
           <span className="fa fa-shopping-cart text-xl"> </span>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600 h-14">
          <div className="col-span-1"></div>
          <div className="col-span-3">Product</div>
          <div className="col-span-1 text-center">Size</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Total Price</div>
          <div className="col-span-1"></div>
        </div>

        {/* Cart Items or Loading/Error */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span>Loading cart...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Error loading cart: {error.message}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Your cart is empty
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center relative hover:bg-gray-50">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input 
                    type="checkbox" 
                    className="mr-2 accent-green-700"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    disabled={updateSelectionMutation.isLoading}
                  />
                </div>

                {/* Product Info */}
                <div className="col-span-3">
                  <Link  to={`/viewProduct/${item.product.id}`} className="flex items-start space-x-3 ">
                    <div className="relative">
                      <img 
                        src={`http://localhost:8000/storage/${item.product?.image}` || "/api/placeholder/80/80"} 
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                    
                    <div className="flex-1 ">
                      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      
                    </div>
                  </Link>
                </div>

                {/* Size */}
                <div className="col-span-1 text-center">
                  <span className="text-sm text-gray-600 capitalize">{item.size}</span>
                </div>

                {/* Unit Price */}
                <div className="col-span-2 text-center">
                  <div className="text-sm">
                    <span className="font-medium">{formatPrice(item?.product_price || 0)}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                      className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1 || updateQuantityMutation.isLoading}
                    >
                      −
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                      className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={updateQuantityMutation.isLoading}
                    >
                      +
                    </button>
                  </div>
                  {/* Show loading state for quantity updates */}
                  {updateQuantityMutation.isLoading && (
                    <div className="text-xs text-gray-500 mt-1">Updating...</div>
                  )}
                </div>

                {/* Total Price */}
                <div className="col-span-2 text-center">
                  <span className="font-medium text-green-700 text-lg">
                    {formatPrice((item?.product_price || 0) * item.quantity)}
                  </span>
                </div>

                {/* Remove */}
                <div className="col-span-1 flex">
                  <button
                    onClick={() => handleRemoveItem(item.product_id, item.size)}
                    className=" text-lg text-red-700 hover:text-red-800 hover:underline flex gap-1 items-center"
                    disabled={removeFromCartMutation.isLoading}
                  > 
                    <span className="fa-solid fa-trash text-sm"></span>
                    <span className='text-xs'>
                        {removeFromCartMutation.isLoading ? 'Removing...' : 'Remove'}
                    </span>
                  </button>
                      
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-4 fixed bottom-0 left-0 right-0 w-[70%] mx-auto ">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input 
                type="checkbox" 
                className='accent-green-700'
                checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                onChange={handleSelectAll}
                disabled={updateSelectionMutation.isLoading}
              />
              <span className="text-sm ">Select All ({cartItems.length})</span>
              <button 
                className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50"
                onClick={handleDeleteSelected}
                disabled={selectedItems.size === 0 || removeFromCartMutation.isLoading}
              >
                Delete Selected
              </button>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Total ({totalSelectedItems} items):
                </div>
                <div className="text-xl font-bold text-green-700">
                  {formatPrice(totalSelectedPrice)}
                </div>
              </div>
              <Link
                to="/order"
                onClick={() => {

                }}
                className={`bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition 
                  ${selectedItems.size === 0 
                    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                    : 'hover:bg-green-700'
                  }`}
              >
                Check Out
              </Link>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};