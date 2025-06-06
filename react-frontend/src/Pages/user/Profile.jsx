import { useState, useEffect } from 'react';
import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import { useForm } from '@inertiajs/react';
import {Link}  from "@inertiajs/react";

export default function Profile({ user }) {
  // Use Inertia's useForm but with initial values that don't include image
  const { data, setData, post, progress, processing, errors } = useForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        _method: 'PUT', // Add this line to spoof the PUT method
  });

  const [isDisabled, setIsDisabled] = useState(true);
  const [imagePreview, setImagePreview] = useState(
        user.image ? `/storage/${user.image}` : '/images/noimage.png'
  );

  const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Set the image in the form data
            setData('image', file);
            
            // Update image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
  };

  const handleSubmit = (e) => {
        e.preventDefault();
        
        post(`/user/${user.id}`, {
          onSuccess: () => {
            setIsDisabled(true);
          }
        });

  };

  const handleChange = (e) => {
    setData(e.target.name, e.target.value);
  };
 
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 ">
      <div className="flex flex-col items-center justify-center">
        <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
          <img
            src={imagePreview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <label
          htmlFor="photo-upload"
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Upload Photo
        </label>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          name="image"
          onChange={handleFileChange}
          disabled={isDisabled}
          className="hidden"
        />
        {progress && (
          <div className="w-full mt-2">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {progress.percentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${progress.percentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-2 bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              disabled={isDisabled}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              disabled={isDisabled}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              disabled={isDisabled}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={data.address}
              onChange={handleChange}
              disabled={isDisabled}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
          </div>

          <div className="flex justify-end space-x-2">
            {isDisabled ? (
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
                onClick={() => setIsDisabled(false)}
              >
                Edit
              </button>
            ) : (
              <div className='flex gap-2'>

              <button
                type="submit"
                disabled={processing}
                className={`${processing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg transition`}
               
              >
                {processing ? 'Saving...' : 'Save'}
              </button>

              <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
                  onClick={() => window.location.reload()}
                >
              Cancel 
              </button>
              </div>
              
           
            )}
            
          </div>
        </form>
      </div>
    </div>
  );
}

// Layout for Inertia
Profile.layout = (page) => <MainLayout auth={page.props.auth} children={page} />;

