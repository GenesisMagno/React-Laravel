import { useState } from 'react';
import { useCreateProduct } from '../../../hooks/useProducts'; // your react-query mutation
import { useNavigate } from 'react-router-dom';

export default function Createproduct() {
  const [formData, setFormData] = useState({
    name: '',
    big: '',
    medium: '',
    platter: '',
    tub: '',
    image: null,
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [includeIngredients, setIncludeIngredients] = useState(false);
  // Initialize ingredients with one empty ingredient
  const [ingredients, setIngredients] = useState([
    { id: 1, name: '', description: '', image: null, imagePreview: null }
  ]);

  const createProduct = useCreateProduct();

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
          updatedIngredient.imagePreview = null;
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
      imagePreview: null 
    }]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    // Add ingredients if included
    if (includeIngredients) {
      payload.append('include_ingredients', 'true');
      ingredients.forEach((ingredient, index) => {
        if (ingredient.name.trim()) {
          payload.append(`ingredients[${index}][name]`, ingredient.name);
          payload.append(`ingredients[${index}][description]`, ingredient.description);
          if (ingredient.image) {
            payload.append(`ingredients[${index}][image]`, ingredient.image);
          }
        }
      });
    }
    
    console.log('FormData contents:');
    payload.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    createProduct.mutate(payload, {
      onSuccess: () => {
        alert('Product created!');
        navigate('/admin/manageproducts');
      },
      onError: (error) => {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
        console.error('Error details:', error.response?.data);
      },
    });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="w-full h-full m-auto rounded-md overflow-hidden flex flex-col">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col overflow-y-auto bg-white rounded-md h-full w-full m-auto p-4"
          encType="multipart/form-data"
        >
          {/* Main Product Form */}
          <div className="ml-8 h-10 text-4xl font-sans font-[500] antialiased mb-10">Create Product</div>
          <div className="flex w-full mb-6 min-h-[500px] py-4">
            {/* Image Upload */}
            <div className="w-3/5 flex flex-col items-center space-y-4 ">
              <div className="w-[600px] h-[450px] overflow-hidden border border-gray-300 bg-gray-200 relative">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 block text-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm">No image selected</div>
                  </div>
                )}
              </div>
              <input
                type="file"
                name="image"
                className="mt-3 text-sm text-gray-900 border rounded-lg cursor-pointer dark:bg-gray-100 dark:placeholder-gray-400"
                onChange={handleFileChange}
              />
              {errors.image && <span className="text-red-500">{errors.image[0]}</span>}
            </div>

            {/* Text Inputs */}
            <div className="w-[35%] flex flex-col justify-center space-y-4">
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
                    className="rounded-md h-12 px-4 text-lg border border-gray-300"
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
                className="mr-3 h-5 w-5 border-gray-300 rounded accent-white"
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
                    <h4 className="text-lg font-medium">Ingredient {index + 1}</h4>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    {/* Ingredient Image */}
                    <div className="w-1/2 flex flex-col items-center">
                      <div className="w-56 h-56 border border-gray-400 bg-gray-100 relative mb-2 rounded-full">
                        {ingredient.imagePreview ? (
                          <img 
                            src={ingredient.imagePreview} 
                            className="w-full h-full object-cover rounded-full" 
                            alt="Ingredient preview"
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
              disabled={createProduct.isLoading}
              className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              {createProduct.isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}