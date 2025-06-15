import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth'; // Adjust the path as needed

export default function Register() {
  const navigate = useNavigate();
  const register = useRegister();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setProcessing(true);

    try {
      await register.mutateAsync(form);

      setSuccessMessage('Registered successfully!');
      setForm({ name: '', email: '', password: '', password_confirmation: '' });

      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      if (error.response?.status === 422 && error.response.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen w-screen">
      <div className="w-1/2 h-screen hidden lg:block">
        <img
          src="/images/gengen.png"
          alt="Register Illustration"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="lg:p-36 md:p-52 sm:p-20 p-8 w-full sm:w-1/2">
        <h1 className="text-2xl font-semibold mb-4">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="name"
            />
            {errors.name && <span className="text-red-700">{errors.name[0]}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="email"
            />
            {errors.email && <span className="text-red-700">{errors.email[0]}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="new-password"
            />
            {errors.password && <span className="text-red-700">{errors.password[0]}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="password_confirmation" className="block text-gray-600">Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="new-password"
            />
          </div>

          {errors.general && <div className="mb-4 text-red-700">{errors.general}</div>}
          {successMessage && <div className="mb-4 text-green-700">{successMessage}</div>}

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full mb-4"
            disabled={processing}
          >
            {processing ? "Registering..." : "Register"}
          </button>

          <hr className="border-none bg-gray-300 h-[1px]" />
        </form>

        <div className="mt-6 text-blue-500 text-center">
          <a href="/login" className="hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
}