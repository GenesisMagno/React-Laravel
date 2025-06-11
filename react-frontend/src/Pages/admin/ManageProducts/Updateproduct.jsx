import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateProduct, useProduct } from '../../../hooks/useProducts';

export default function Updateproduct() {
  const { id } = useParams();
  const updateProduct = useUpdateProduct();
  const { data, isLoading, isError } = useProduct(id);
  const [formData, setFormData] = useState({
    name: '',
    big: '',
    medium: '',
    platter: '',
    tub: '',
    image: null, // Keep this for file uploads only
  });

  const product = data?.product;
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(''); // Separate state for existing image

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        big: product.big || '',
        medium: product.medium || '',
        platter: product.platter || '',
        tub: product.tub || '',
        image: null, // Don't set the URL here
      });
      
      // Set the existing image URL separately
      const imageUrl = product.image ? `http://localhost:8000/storage/${product.image}` : '';
      setExistingImageUrl(imageUrl);
      
      // If no new image is selected, show the existing image
      if (!imagePreview && imageUrl) {
        setImagePreview(imageUrl);
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

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="w-full h-full m-auto rounded-md overflow-hidden flex flex-col">
        <div className="ml-8 h-10 text-4xl font-sans font-[500] antialiased">Update Product</div>

        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center overflow-hidden bg-white rounded-md h-[80%] w-4/5 m-auto"
          encType="multipart/form-data"
        >
          {errors.general && (
            <div className="w-full text-center text-red-500 mb-4">
              {errors.general}
            </div>
          )}

          {/* Image Upload */}
          <div className="w-3/5 h-full pt-8 flex flex-col items-center overflow-hidden space-y-4">
            <div className="w-[700px] h-[500px] max-w-4/5 max-h-3/5 overflow-hidden border border-dashed border-black bg-gray-200 relative">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Product preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', imagePreview);
                    setImagePreview(null); // Clear preview if image fails to load
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

          {/* Text Inputs */}
          <div className="w-[35%] h-full pt-8 block">
            {[
              { name: 'name', label: 'Product Name' },
              { name: 'big', label: 'Big Price' },
              { name: 'medium', label: 'Medium Price' },
              { name: 'platter', label: 'Platter Price' },
              { name: 'tub', label: 'Tub Price' },
            ].map((field) => (
              <div className="mb-4 flex flex-col" key={field.name}>
                <label className="text-2xl">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className="rounded-md h-10 w-4/5 text-xl border border-black mt-2 px-6 m-auto"
                />
                {errors[field.name] && <span className="text-red-500">{errors[field.name][0]}</span>}
              </div>
            ))}

            <div className="m-auto text-center">
              <button
                type="submit"
                disabled={updateProduct.isLoading}
                className="border rounded-sm bg-green-700 w-32 h-10 text-white disabled:opacity-50"
              >
                {updateProduct.isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}