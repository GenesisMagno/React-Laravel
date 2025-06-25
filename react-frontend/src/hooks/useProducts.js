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
      
      // Optionally set the new product in cache
      if (data.product) {
        queryClient.setQueryData(['product', data.product.id], data.product);
      }
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

// ===============================
// 3. Helper function to build FormData for products with ingredients
// ===============================

export const buildProductFormData = (productData) => {
  const formData = new FormData();
  
  // Add basic product fields
  if (productData.name) formData.append('name', productData.name);
  if (productData.big) formData.append('big', productData.big);
  if (productData.medium) formData.append('medium', productData.medium);
  if (productData.platter) formData.append('platter', productData.platter);
  if (productData.tub) formData.append('tub', productData.tub);
  
  // Add main product image
  if (productData.image && productData.image instanceof File) {
    formData.append('image', productData.image);
  }
  
  // Add ingredients
  if (productData.ingredients && Array.isArray(productData.ingredients)) {
    productData.ingredients.forEach((ingredient, index) => {
      // Add ingredient ID if updating existing ingredient
      if (ingredient.id) {
        formData.append(`ingredients[${index}][id]`, ingredient.id);
      }
      
      // Add ingredient fields
      formData.append(`ingredients[${index}][ingredient_name]`, ingredient.ingredient_name);
      
      if (ingredient.ingredient_description) {
        formData.append(`ingredients[${index}][ingredient_description]`, ingredient.ingredient_description);
      }
      
      // Add ingredient image if it's a File object
      if (ingredient.ingredient_image && ingredient.ingredient_image instanceof File) {
        formData.append(`ingredients[${index}][ingredient_image]`, ingredient.ingredient_image);
      }
      
      // Add remove image flag
      if (ingredient.remove_image) {
        formData.append(`ingredients[${index}][remove_image]`, ingredient.remove_image);
      }
    });
  }
  
  // Add ingredients to delete (for updates)
  if (productData.delete_ingredients && Array.isArray(productData.delete_ingredients)) {
    productData.delete_ingredients.forEach((ingredientId, index) => {
      formData.append(`delete_ingredients[${index}]`, ingredientId);
    });
  }
  
  return formData;
};

// ===============================
// 4. Example usage in React component
// ===============================

// Example Create Product Component
export const CreateProductExample = () => {
  const createProduct = useCreateProduct();
  
  const handleSubmit = async (formValues) => {
    try {
      const formData = buildProductFormData(formValues);
      await createProduct.mutateAsync(formData);
      // Handle success (show toast, redirect, etc.)
    } catch (error) {
      // Handle error
      console.error('Failed to create product:', error);
    }
  };
  
  // Your form JSX here...
};

// Example Update Product Component
export const UpdateProductExample = ({ productId }) => {
  const updateProduct = useUpdateProduct();
  const { data: product } = useProduct(productId);
  
  const handleSubmit = async (formValues) => {
    try {
      const formData = buildProductFormData(formValues);
      await updateProduct.mutateAsync({ id: productId, formData });
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Failed to update product:', error);
    }
  };
  
  // Your form JSX here...
};