import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProduct, useProduct } from '../../../hooks/useProducts';
import api from '../../../axios';

export default function Updateproduct() {
  const { id } = useParams();
  const updateProduct = useUpdateProduct();
  const { data, isLoading, isError } = useProduct(id);
  const [includeIngredients, setIncludeIngredients] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    big: '',
    medium: '',
    platter: '',
    tub: '',
    image: null,
  });

  const product = data?.product;
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [deletingIngredientId, setDeletingIngredientId] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        big: product.big || '',
        medium: product.medium || '',
        platter: product.platter || '',
        tub: product.tub || '',
        image: null,
      });
      
      // Set the existing image URL separately
      const imageUrl = product.image ? `http://localhost:8000/storage/${product.image}` : '';
      setExistingImageUrl(imageUrl);
      
      // If no new image is selected, show the existing image
      if (!imagePreview && imageUrl) {
        setImagePreview(imageUrl);
      }

      // Handle existing ingredients
      if (product.ingredients && product.ingredients.length > 0) {
        setIncludeIngredients(true);
        const existingIngredients = product.ingredients.map((ingredient, index) => ({
          id: ingredient.id, // Use the actual database ID
          dbId: ingredient.id, // Keep track of database ID
          name: ingredient.name || '',
          description: ingredient.description || '',
          image: null, // For new file uploads
          imagePreview: ingredient.image ? `http://localhost:8000/storage/${ingredient.image}` : null,
          existingImageUrl: ingredient.image ? `http://localhost:8000/storage/${ingredient.image}` : '',
          isExisting: true // Flag to identify existing ingredients
        }));
        setIngredients(existingIngredients);
      } else {
        // Initialize with one empty ingredient if no existing ingredients
        setIngredients([
          { id: 1, name: '', description: '', image: null, imagePreview: null, isExisting: false }
        ]);
      }
    }
  }, [product]);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file selected, revert to existing image
      setImagePreview(existingImageUrl);
    }
  };

  const handleIngredientChange = (id, field, value) => {
    setIngredients(prev => prev.map(ingredient => 
      ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
    ));
  };

  const handleIngredientImageChange = (id, file) => {
    setIngredients(prev => prev.map(ingredient => {
      if (ingredient.id === id) {
        const updatedIngredient = { ...ingredient, image: file };
        
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setIngredients(current => current.map(ing => 
              ing.id === id ? { ...ing, imagePreview: reader.result } : ing
            ));
          };
          reader.readAsDataURL(file);
        } else {
          // If no new file, revert to existing image if available
          updatedIngredient.imagePreview = updatedIngredient.existingImageUrl || null;
        }
        
        return updatedIngredient;
      }
      return ingredient;
    }));
  };

  const addIngredient = () => {
    const newId = Math.max(...ingredients.map(ing => ing.id), 0) + 1;
    setIngredients(prev => [...prev, { 
      id: newId, 
      name: '', 
      description: '', 
      image: null, 
      imagePreview: null,
      isExisting: false
    }]);
  };

  // Updated removeIngredient function to handle database deletion
  const removeIngredient = async (ingredientId) => {
    // Find the ingredient to check if it's existing in the database
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    
    if (ingredient && ingredient.isExisting && ingredient.dbId) {
      // If it's an existing ingredient, delete from database
      if (window.confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
        try {
          setDeletingIngredientId(ingredientId);
          
          // Make API call to delete ingredient from database
          await api.delete(`/products/${id}/ingredients/${ingredient.dbId}`);
          
          // Remove from local state after successful deletion
          setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
          
          // Show success message (optional)
          console.log('Ingredient deleted successfully');
          
        } catch (error) {
          console.error('Error deleting ingredient:', error);
          
          // Handle error - show user feedback
          let errorMessage = 'Failed to delete ingredient';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          
          // You can set this to show in your UI
          setErrors(prev => ({ ...prev, ingredient: errorMessage }));
          
        } finally {
          setDeletingIngredientId(null);
        }
      }
    } else {
      // If it's a new ingredient (not in database), just remove from local state
      if (ingredients.length > 1) {
        setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = new FormData();
      payload.append('_method', 'PUT');
      
      payload.append('name', formData.name || '');
      payload.append('big', formData.big || '');
      payload.append('medium', formData.medium || '');
      payload.append('platter', formData.platter || '');
      payload.append('tub', formData.tub || '');
      
      // Only append image if a new file was selected
      if (formData.image instanceof File) {
        payload.append('image', formData.image);
      }

      // Handle ingredients if included
      if (includeIngredients && ingredients.length > 0) {
        ingredients.forEach((ingredient, index) => {
          // Skip empty ingredients
          if (!ingredient.name.trim()) return;

          // For existing ingredients, include the database ID
          if (ingredient.isExisting && ingredient.dbId) {
            payload.append(`ingredients[${index}][id]`, ingredient.dbId);
          }
          
          payload.append(`ingredients[${index}][name]`, ingredient.name);
          payload.append(`ingredients[${index}][description]`, ingredient.description || '');
          
          // Only append image if a new file was selected
          if (ingredient.image instanceof File) {
            payload.append(`ingredients[${index}][image]`, ingredient.image);
          }
        });
      }

      await updateProduct.mutateAsync({ id, formData: payload });
      navigate('/admin/manageproducts');
    } catch (error) {
      console.error('Full error object:', error);
      
      if (error.response?.status === 422) {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'Validation failed. Please check your input.' });
        }
      } else {
        setErrors({ general: 'An error occurred while updating the product' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Loading product...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading product</div>
          <button
            onClick={() => navigate('/admin/manageproducts')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="w-full h-full m-auto rounded-md overflow-hidden flex flex-col">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col overflow-y-auto bg-white rounded-md h-full w-full m-auto p-4"
          encType="multipart/form-data"
        >
          {/* Header */}
          <div className="ml-8 h-10 text-4xl font-sans font-[500] antialiased mb-10">Update Product</div>

          {/* General Error Display */}
          {errors.general && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-600 text-center">{errors.general}</div>
            </div>
          )}

          {/* Ingredient Error Display */}
          {errors.ingredient && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-600 text-center">{errors.ingredient}</div>
            </div>
          )}

          {/* Main Form Content */}
          <div className="flex w-full mb-6 min-h-[500px]">
            {/* Image Upload Section */}
            <div className="w-3/5 flex flex-col items-center space-y-4 py-4">
              <div className="w-[600px] h-[100%] overflow-hidden border border-gray-200 bg-gray-200 relative">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', imagePreview);
                      setImagePreview(null);
                    }}
                  />
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 block text-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm">No image selected</div>
                  </div>
                )}
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="mt-3 text-sm text-gray-900 border rounded-lg cursor-pointer dark:bg-gray-100 dark:placeholder-gray-400"
                onChange={handleFileChange}
              />
              {errors.image && <span className="text-red-500">{errors.image[0]}</span>}
            </div>

            {/* Text Inputs Section */}
            <div className="w-[35%] h-full flex flex-col justify-center space-y-4">
              {[
                { name: 'name', label: 'Product Name' },
                { name: 'big', label: 'Big Price' },
                { name: 'medium', label: 'Medium Price' },
                { name: 'platter', label: 'Platter Price' },
                { name: 'tub', label: 'Tub Price' },
              ].map((field) => (
                <div className="flex flex-col" key={field.name}>
                  <label className="text-xl font-medium mb-2">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="rounded-md h-12 px-4 text-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {errors[field.name] && <span className="text-red-500 text-sm mt-1">{errors[field.name][0]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Toggle */}
          <div className="w-4/5 mb-6 mx-auto">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="includeIngredients"
                checked={includeIngredients}
                onChange={(e) => setIncludeIngredients(e.target.checked)}
                className="mr-3 h-5 w-5   border-gray-300 rounded accent-white "
              />
              <label htmlFor="includeIngredients" className="text-lg font-medium text-gray-700 cursor-pointer">
                Include Product Ingredients
              </label>
            </div>
          </div>

          {/* Ingredients Section */}
          {includeIngredients && (
            <div className="w-4/5 mx-auto">
              <h3 className="text-2xl font-medium mb-4">Ingredients</h3>
              
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium">
                      Ingredient {index + 1}
                      {ingredient.isExisting && (
                        <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Existing
                        </span>
                      )}
                    </h4>
                   
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        disabled={deletingIngredientId === ingredient.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {deletingIngredientId === ingredient.id ? (
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                   
                  </div>
                  
                  <div className="flex gap-4">
                    {/* Ingredient Image */}
                    <div className="w-1/2 flex flex-col items-center">
                      <div className="w-56 h-56 border  border-gray-400 bg-gray-100 relative mb-2 rounded-full">
                        {ingredient.imagePreview ? (
                          <img 
                            src={ingredient.imagePreview} 
                            className="w-full h-full object-fill rounded-full" 
                            alt="Ingredient preview"
                            onError={(e) => {
                              console.error('Ingredient image failed to load:', ingredient.imagePreview);
                              setIngredients(current => current.map(ing => 
                                ing.id === ingredient.id ? { ...ing, imagePreview: null } : ing
                              ));
                            }}
                          />
                        ) : (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-sm text-gray-500">Ingredient Image</div>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIngredientImageChange(ingredient.id, e.target.files[0])}
                        className="text-sm text-gray-900 border rounded-lg cursor-pointer w-2/5"
                      />
                      {ingredient.isExisting && ingredient.existingImageUrl && (
                        <div className="text-xs text-gray-500 mt-1">
                          Current: {ingredient.existingImageUrl.split('/').pop()}
                        </div>
                      )}
                    </div>

                    {/* Ingredient Details */}
                    <div className="w-1/2 space-y-4">
                      <div>
                        <label className="block text-lg font-medium mb-1">Ingredient Name</label>
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-md"
                          placeholder="Enter ingredient name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-lg font-medium mb-1">Ingredient Description</label>
                        <textarea
                          value={ingredient.description}
                          onChange={(e) => handleIngredientChange(ingredient.id, 'description', e.target.value)}
                          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none"
                          placeholder="Enter ingredient description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add More Ingredients Button */}
              <button
                type="button"
                onClick={addIngredient}
                className="mb-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="w-full text-center pt-4">
            <button
              type="submit"
              disabled={updateProduct.isLoading}
              className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              {updateProduct.isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}