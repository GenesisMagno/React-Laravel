import { useState } from 'react';

export default function Cart(){
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "AMD Ryzen 7 7700X 8 Core 16 Thread Processor",
      image: "/api/placeholder/80/80",
      price: 20995,
      quantity: 1,
      size: "Standard",
    },
    {
      id: 2,
      name: "PlayStation PS5 Slim Console - Disc Version",
      image: "/api/placeholder/80/80",
      price: 33490,
      originalPrice: 40929,
      quantity: 1,
      size: "825GB",
    },
    {
      id: 3,
      name: "Lexar NM610 Pro M.2 2280 PCIe Gen3x4 NVMe Internal SSD",
      image: "/api/placeholder/80/80",
      price: 3250,
      quantity: 1,
      size: "1TB",
    },
    {
      id: 4,
      name: "Sapphire Pulse AMD Radeon™ RX 7800 XT 16GB/256 bit DDR6 Du...",
      image: "/api/placeholder/80/80",
      price: 33395,
      quantity: 1,
      size: "16GB",
    },
    {
      id: 5,
      name: "darkFlash Nebula DN-360 RGB AII-In-One 360mm Liquid CPU...",
      image: "/api/placeholder/80/80",
      price: 4150,
      quantity: 1,
      size: "360mm",
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };


  const formatPrice = (price) => {
    return `₱${price.toLocaleString()}`;
  };

  return (
    <div className="w-full mx-auto max-w-full p-4 bg-gray-50 h-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="flex items-center p-4 border-b border-b-gray-300">
          <span className="text-green-600 font-medium mr-4">Shopping Cart</span>
           <span className="fa fa-shopping-cart text-xl"> </span>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600">
          <div className="col-span-1"></div>
          <div className="col-span-4">Product</div>
          <div className="col-span-1 text-center">Size</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Total Price</div>
          
        </div>

        {/* Cart Items */}
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center relative">
              
              
              {/* Checkbox */}
              <div className="col-span-1">
                <input type="checkbox" className="mr-2" />
              </div>

              {/* Product Info */}
              <div className="col-span-4">
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                 
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="col-span-1 text-center">
                <span className="text-sm text-gray-600">{item.size}</span>
              </div>

              {/* Unit Price */}
              <div className="col-span-2 text-center">
                <div className="text-sm">
                  {item.originalPrice && (
                    <span className="text-gray-400 line-through text-xs block">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                  <span className="font-medium">{formatPrice(item.price)}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                
              </div>

              {/* Total Price */}
              <div className="col-span-2 text-center">
                <span className="font-medium text-green-600">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 fixed bottom-0 left-0 right-0 w-[70%] mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <input type="checkbox" />
            <span className="text-sm">Select All ({cartItems.length})</span>
            <button className="text-sm text-green-600 hover:text-green-700">Delete</button>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Total ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):
              </div>
              <div className="text-xl font-bold text-red-500">
                {formatPrice(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium">
              Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};