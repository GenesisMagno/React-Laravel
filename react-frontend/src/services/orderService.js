import api from '../axios';

// Get user's orders
export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Get specific order by ID
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Place order from cart
export const placeOrderFromCart = async (orderData) => {
  const response = await api.post('/orders/place-from-cart', orderData);
  return response.data;
};

// Quick order (without cart)
export const quickOrder = async (orderData) => {
  const response = await api.post('/orders/quick-order', orderData);
  return response.data;
};

// Cancel order
export const cancelOrder = async (id) => {
  const response = await api.post(`/orders/${id}/cancel`);
  return response.data;
};

// Admin: Update order status
export const updateOrderStatus = async ({ id, status }) => {
  const response = await api.post(`/orders/${id}/status`, { status });
  return response.data;
};