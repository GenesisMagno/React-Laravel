import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderService from '../services/orderService';

// Get user's orders
export const useUserOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getUserOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get specific order by ID
export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Place order from cart
export const usePlaceOrderFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orderService.placeOrderFromCart,
    onSuccess: (data) => {
      // Invalidate orders list to show new order
      queryClient.invalidateQueries(['orders']);
      
      // Invalidate cart since it should be cleared after order
      queryClient.invalidateQueries(['cart']);
      
      // Cache the new order
      if (data.order) {
        queryClient.setQueryData(['order', data.order.id], data.order);
      }
    },
    onError: (error) => {
      console.error('Error placing order from cart:', error);
    },
  });
};

// Quick order (without cart)
export const useQuickOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orderService.quickOrder,
    onSuccess: (data) => {
      // Invalidate orders list to show new order
      queryClient.invalidateQueries(['orders']);
      
      // Cache the new order
      if (data.order) {
        queryClient.setQueryData(['order', data.order.id], data.order);
      }
    },
    onError: (error) => {
      console.error('Error placing quick order:', error);
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: (data, orderId) => {
      // Invalidate orders list to reflect cancellation
      queryClient.invalidateQueries(['orders']);
      
      // Update the specific order in cache if returned
      if (data.order) {
        queryClient.setQueryData(['order', orderId], data.order);
      } else {
        // If no order data returned, invalidate the specific order
        queryClient.invalidateQueries(['order', orderId]);
      }
    },
    onError: (error) => {
      console.error('Error canceling order:', error);
    },
  });
};

// Admin: Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orderService.updateOrderStatus,
    onSuccess: (data, variables) => {
      // Invalidate orders list to reflect status change
      queryClient.invalidateQueries(['orders']);
      
      // Update the specific order in cache if returned
      if (data.order) {
        queryClient.setQueryData(['order', variables.id], data.order);
      } else {
        // If no order data returned, invalidate the specific order
        queryClient.invalidateQueries(['order', variables.id]);
      }
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
    },
  });
};