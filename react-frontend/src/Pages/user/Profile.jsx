import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUpdateUser, useUser } from '../../hooks/useUser';
import { Camera, Edit3, Save, X, User, Mail, Phone, MapPin, Check } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
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
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSubmit = async () => {
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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

  const handleCancel = () => {
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
  };

  if (userLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg text-gray-700">Loading...</span>
      </div>
    </div>
  );
  
  if (userError) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
        Error loading user.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-slide-in">
            <Check className="w-5 h-5" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-blue-300 to-indigo-200 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative p-8 md:p-12">
              {/* General Error Message */}
              {errors.general && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Profile Image Section */}
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-white shadow-2xl transform transition-transform group-hover:scale-105">
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
                      <label className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full cursor-pointer shadow-lg transform transition-all hover:scale-110 group">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isDisabled}
                          className="hidden"
                        />
                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Change Photo
                        </div>
                      </label>
                    )}
                  </div>
                  
                  {errors.image && (
                    <span className="text-red-500 text-sm mt-2">{errors.image[0]}</span>
                  )}
                  
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">{formData.name || 'User'}</h3>
                    <p className="text-gray-600 mt-1">Premium Member</p>
                    <div className="mt-4 flex justify-center">
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-700">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white/50 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-semibold text-gray-900">Personal Information</h4>
                      {isDisabled && (
                        <button
                          onClick={() => setIsDisabled(false)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="group">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4" />
                            <span>Full Name</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                          />
                          {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name[0]}</span>}
                        </div>

                        {/* Email Field */}
                        <div className="group">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4" />
                            <span>Email Address</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                          />
                          {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email[0]}</span>}
                        </div>

                        {/* Phone Field */}
                        <div className="group">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4" />
                            <span>Phone Number</span>
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            placeholder="Enter your phone number"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                          />
                          {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone[0]}</span>}
                        </div>

                        {/* Address Field */}
                        <div className="group md:col-span-2">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>Address</span>
                          </label>
                          <textarea
                            name="address"
                            rows="3"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            placeholder="Enter your address"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                          />
                          {errors.address && <span className="text-red-500 text-sm mt-1">{errors.address[0]}</span>}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!isDisabled && (
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={updateUser.isLoading}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                          >
                            {updateUser.isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">5</span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Orders</h5>
                <p className="text-sm text-gray-600">Total purchases</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">★</span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Premium</h5>
                <p className="text-sm text-gray-600">Member status</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Reviews</h5>
                <p className="text-sm text-gray-600">Product ratings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}