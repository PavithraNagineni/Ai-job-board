import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'candidate' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data); toast.success(`Account created! Welcome, ${data.name} 🎉`);
      navigate(data.role === 'employer' ? '/dashboard' : '/jobs');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={s.wrapper}>
      <div style={s.card} className="card">
        <div style={s.logo}>⚡ TalentAI</div>
        <h2 style={{ marginBottom:6 }}>Create your account</h2>
        <p style={{ color:'#888899',marginBottom:24,fontSize:14 }}>Start your AI-powered job journey</p>
        <div style={s.roleSelector}>
          {['candidate','employer'].map(r => (
            <button key={r} type="button" onClick={() => setForm({ ...form, role:r })}
              style={{ ...s.roleBtn, ...(form.role===r ? s.roleBtnActive:{}) }}>
              {r==='candidate' ? '👤 Job Seeker' : '🏢 Employer'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" className="form-control" placeholder="Pavithra Nagineni" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:14,marginTop:8 }} disabled={loading}>
            {loading ? <><span className="spinner" />Creating...</> : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign:'center',marginTop:20,fontSize:14,color:'#888899' }}>
          Already have an account? <Link to="/login" style={{ color:'#6c63ff' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
const s = {
  wrapper:{ minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 },
  card:{ width:'100%',maxWidth:440 },
  logo:{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,marginBottom:24,color:'#6c63ff' },
  roleSelector:{ display:'flex',gap:12,marginBottom:24 },
  roleBtn:{ flex:1,padding:'10px 16px',borderRadius:8,border:'1px solid #2a2a3a',background:'transparent',color:'#888899',fontWeight:600,fontSize:14,cursor:'pointer',transition:'all 0.2s' },
  roleBtnActive:{ border:'1px solid #6c63ff',background:'rgba(108,99,255,0.1)',color:'#6c63ff' },
};
