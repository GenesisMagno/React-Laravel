import React, { useState, useEffect } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { Link } from '@inertiajs/react';
import { Package, Truck, CreditCard, Clock, CheckCircle, AlertCircle, ArrowLeft, Printer } from 'lucide-react';

const orderData = {
  orderId: "#ORD-7829",
  date: "May 19, 2025",
  status: "Processing",
  customer: {
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "(555) 123-4567"
  },
  shipping: {
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    method: "Standard Shipping",
    estimatedDelivery: "May 24-26, 2025"
  },
  payment: {
    method: "Credit Card",
    cardLast4: "4242",
    total: 127.84,
    subtotal: 109.99,
    tax: 9.35,
    shipping: 8.50
  },
  items: [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      sku: "SKU-789121",
      price: 89.99,
      quantity: 1,
      image: "/api/placeholder/80/80"
    },
    {
      id: 2,
      name: "USB-C Charging Cable",
      sku: "SKU-354211",
      price: 19.99,
      quantity: 1,
      image: "/api/placeholder/80/80"
    }
  ]
};

// Status badge component
const StatusBadge = ({ status }) => {
  let badgeClass = "";
  let Icon = Clock;
  
  switch(status.toLowerCase()) {
    case "completed":
      badgeClass = "bg-green-100 text-green-800";
      Icon = CheckCircle;
      break;
    case "processing":
      badgeClass = "bg-blue-100 text-blue-800";
      Icon = Clock;
      break;
    case "cancelled":
      badgeClass = "bg-red-100 text-red-800";
      Icon = AlertCircle;
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
      <Icon size={16} className="mr-1" />
      {status}
    </span>
  );
};

export default function Order({ product }) {
   const [activeTab, setActiveTab] = useState('details');

    return (
         <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <button className="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order {orderData.orderId}</h1>
              <p className="text-gray-500">Placed on {orderData.date}</p>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-3">
            <StatusBadge status={orderData.status} />
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Printer size={16} className="mr-2" />
              Print
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order Details
            </button>
            <button 
              onClick={() => setActiveTab('tracking')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tracking
            </button>
          </nav>
        </div>

        {/* Main Content */}
        {activeTab === 'details' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order summary and items */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Items</h2>
                </div>
                <div className="px-6 py-4">
                  <ul className="divide-y divide-gray-200">
                    {orderData.items.map(item => (
                      <li key={item.id} className="py-4 flex">
                        <img className="h-20 w-20 rounded-md object-cover" src={item.image} alt={item.name} />
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                              <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            
              {/* Payment information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-gray-700">
                      {orderData.payment.method} ending in {orderData.payment.cardLast4}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <dl className="divide-y divide-gray-200">
                      <div className="py-2 flex justify-between text-sm">
                        <dt className="text-gray-500">Subtotal</dt>
                        <dd className="text-gray-900 font-medium">${orderData.payment.subtotal.toFixed(2)}</dd>
                      </div>
                      <div className="py-2 flex justify-between text-sm">
                        <dt className="text-gray-500">Shipping</dt>
                        <dd className="text-gray-900 font-medium">${orderData.payment.shipping.toFixed(2)}</dd>
                      </div>
                      <div className="py-2 flex justify-between text-sm">
                        <dt className="text-gray-500">Tax</dt>
                        <dd className="text-gray-900 font-medium">${orderData.payment.tax.toFixed(2)}</dd>
                      </div>
                      <div className="py-2 flex justify-between text-base font-medium">
                        <dt className="text-gray-900">Total</dt>
                        <dd className="text-gray-900">${orderData.payment.total.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer and Shipping Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Customer</h2>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-900 font-medium">{orderData.customer.name}</p>
                  <p className="text-gray-500">{orderData.customer.email}</p>
                  <p className="text-gray-500">{orderData.customer.phone}</p>
                </div>
              </div>
            
              {/* Shipping Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-start mb-4">
                    <Package className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-2">
                      <p className="text-gray-900 font-medium">Shipping Address</p>
                      <address className="mt-1 not-italic text-gray-500">
                        {orderData.shipping.address}<br />
                        {orderData.shipping.city}, {orderData.shipping.state} {orderData.shipping.zip}
                      </address>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-6">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <div className="ml-2">
                      <p className="text-gray-900 font-medium">{orderData.shipping.method}</p>
                      <p className="text-gray-500 text-sm">Estimated delivery: {orderData.shipping.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Truck size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Your order is on its way!</h3>
                <p className="text-gray-500">Estimated delivery: {orderData.shipping.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    );
}

Order.layout = (page) => <MainLayout auth={page.props.auth} children={page}/>;
