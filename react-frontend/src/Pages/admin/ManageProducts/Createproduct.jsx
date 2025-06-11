import { useState } from 'react';
import { useCreateProduct } from '../../../hooks/useProducts'; // your react-query mutation
import {  useNavigate } from 'react-router-dom';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    createProduct.mutate(payload, {
      onSuccess: () => {
        alert('Product created!');
        navigate('/admin/manageproducts');
        // reset form or redirect as needed
      },
      onError: (error) => {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      },
    });
  };

  return (
    <div className="h-full w-full overflow-hidden ">
      <div className=" w-full h-full m-auto rounded-md overflow-hidden flex flex-col">
        <div className="ml-8 h-10 text-4xl font-sans font-[500] antialiased">Create Product</div>

        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center overflow-hidden bg-white rounded-md h-[80%] w-4/5 m-auto"
          encType="multipart/form-data"
        >
          {/* Image Upload */}
          <div className="w-3/5 h-full pt-8 flex flex-col items-center overflow-hidden space-y-4">
            <div className="w-[700px] h-[500px] max-w-4/5 max-h-3/5 overflow-hidden border border-dashed border-black bg-gray-200 relative">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" />
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
                disabled={createProduct.isLoading}
                className="border rounded-sm bg-green-700 w-32 h-10 text-white"
              >
                {createProduct.isLoading ? 'Saving...' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

