import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUpdateUser, useUser } from '../../hooks/useUser';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateUser = useUpdateUser();
  const { data, isLoading: userLoading, isError: userError } = useUser(id);
  const user = data?.user;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    image: null, // Keep this for file uploads only
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(''); // Separate state for existing image
  const [isDisabled, setIsDisabled] = useState(true);

  // Populate form and image preview when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        image: null, // Don't set the URL here
      });
      
      // Set the existing image URL separately
      const imageUrl = user.image ? `http://localhost:8000/storage/${user.image}` : 'http://localhost:8000/images/noimage.png';
      setExistingImageUrl(imageUrl);
      
      // If no new image is selected, show the existing image
      if (!imagePreview && imageUrl) {
        setImagePreview(imageUrl);
      }
    }
  }, [user]);

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
      payload.append('email', formData.email || '');
      payload.append('phone', formData.phone || '');
      payload.append('address', formData.address || '');
      
      // Only append image if a new file was selected
      if (formData.image instanceof File) {
        payload.append('image', formData.image);
      }


      await updateUser.mutateAsync({ id, formData: payload });
      setIsDisabled(true); // Disable form after successful update
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
        setErrors({ general: 'An error occurred while updating the profile' });
      }
    }
  };

  if (userLoading) return <p>Loading...</p>;
  if (userError) return <p>Error loading user.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* General Error Message */}
      {errors.general && (
        <div className="col-span-full text-center text-red-500 mb-4">
          {errors.general}
        </div>
      )}

      {/* Image Section */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
          <img 
            src={imagePreview} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              setImagePreview('http://localhost:8000/images/noimage.png'); // Fallback to default image
            }}
          />
        </div>
        {!isDisabled && (
          <>
            <label htmlFor="photo-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Upload Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isDisabled}
              className="hidden"
            />
            {errors.image && <span className="text-red-500 text-sm mt-1">{errors.image[0]}</span>}
          </>
        )}
      </div>

      {/* Form Section */}
      <div className="col-span-2 bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Phone', type: 'text' },
            { name: 'address', label: 'Address', type: 'textarea' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type !== 'textarea' ? (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <textarea
                  name={field.name}
                  rows="3"
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {errors[field.name] && <span className="text-red-500 text-sm">{errors[field.name][0]}</span>}
            </div>
          ))}

          {/* Form Buttons */}
          {!isDisabled && (
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={updateUser.isLoading}
                className={`${updateUser.isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg disabled:opacity-50`}
              >
                {updateUser.isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDisabled(true);
                  setErrors({});
                  // Reset form to original values
                  if (user) {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      address: user.address || "",
                      image: null,
                    });
                    setImagePreview(existingImageUrl);
                  }
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {/* Edit Button (outside form to prevent accidental submit) */}
        {isDisabled && (
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsDisabled(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}