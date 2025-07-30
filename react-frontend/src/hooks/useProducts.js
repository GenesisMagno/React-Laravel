import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productService from '../services/productService';

export const useProducts = (page, perPage, search = '') => {
  return useQuery({
    queryKey: ['products', page, perPage, search],
    queryFn: () => productService.getProducts(page, perPage, search),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries(['products']);
    
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.updateProduct,
    onSuccess: (data, variables) => {
      // Invalidate products list
      queryClient.invalidateQueries(['products']);
      
      // Update the specific product in cache
      if (data.product) {
        queryClient.setQueryData(['product', variables.id], data.product);
      }
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (data, productId) => {
      // Invalidate products list
      queryClient.invalidateQueries(['products']);
      
      // Remove the specific product from cache
      queryClient.removeQueries(['product', productId]);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteIngredient,
    onSuccess: (data, productId) => {
      // Invalidate products list
      queryClient.invalidateQueries(['products']);
      
      // Remove the specific product from cache
      queryClient.removeQueries(['product', productId]);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
};

