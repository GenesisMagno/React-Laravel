// Register.jsx
import  { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await api.post('/register', form);

      setSuccessMessage(response.data.message || 'Registered successfully!');
      setForm({ email: '', password: '', password_confirmation: '' });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        alert('Something went wrong!');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Register</h2>
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div style={{ color: 'red' }}>{errors.email[0]}</div>}
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <div style={{ color: 'red' }}>{errors.password[0]}</div>}
        </div>
        <div>
          <label>Confirm Password:</label><br />
          <input
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
          />
        </div>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
