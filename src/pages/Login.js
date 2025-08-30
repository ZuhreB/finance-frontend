import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { authAPI } from '../services/api';
import '../styles/Login.css'; 

const Login = () => {
  console.log('Rendering Login component');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  console.log('Login formData state çalıştı:', formData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log('Login form submitted with:', formData);
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      console.log('Login response:', response);
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        window.location.reload(); // Sayfayı yenile
      } else {
        setError('Login response is missing token or user data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Giriş Yap</h2>
      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label">Kullanıcı Adı:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Şifre:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="register-link">
        Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
      </p>
    </div>
  );
};

export default Login;