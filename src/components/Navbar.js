import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <Link to="/" style={s.logo}><span>⚡</span><span>TalentAI</span></Link>
        <div style={s.links}>
          <Link to="/jobs" style={{ ...s.link, ...(isActive('/jobs') ? s.linkActive : {}) }}>Browse Jobs</Link>
          {user?.role === 'employer' && <>
            <Link to="/post-job" style={{ ...s.link, ...(isActive('/post-job') ? s.linkActive : {}) }}>Post a Job</Link>
            <Link to="/dashboard" style={{ ...s.link, ...(isActive('/dashboard') ? s.linkActive : {}) }}>Dashboard</Link>
          </>}
          {user?.role === 'candidate' &&
            <Link to="/applications" style={{ ...s.link, ...(isActive('/applications') ? s.linkActive : {}) }}>My Applications</Link>
          }
        </div>
        <div style={s.actions}>
          {user ? (
            <>
              <Link to="/profile" style={s.avatar}>{user.name.charAt(0).toUpperCase()}</Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: { background:'rgba(10,10,15,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid #2a2a3a',position:'sticky',top:0,zIndex:100 },
  inner: { maxWidth:1200,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',gap:32 },
  logo: { display:'flex',alignItems:'center',gap:8,fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#e8e8f0',flexShrink:0 },
  links: { display:'flex',gap:4,flex:1 },
  link: { padding:'6px 14px',borderRadius:8,fontSize:14,fontWeight:500,color:'#888899',transition:'all 0.2s' },
  linkActive: { color:'#e8e8f0',background:'#1c1c26' },
  actions: { display:'flex',alignItems:'center',gap:12,flexShrink:0 },
  avatar: { width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#ff6584)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:'white',cursor:'pointer' },
};
