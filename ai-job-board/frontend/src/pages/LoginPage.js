import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.role === 'employer' ? '/dashboard' : '/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} className="card">
        <div style={styles.logo}>⚡ TalentAI</div>
        <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: '#888899', marginBottom: 28, fontSize: 14 }}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }} disabled={loading}>
            {loading ? <><span className="spinner" />Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888899' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6c63ff' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420 },
  logo: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 24, color: '#6c63ff' },
};
