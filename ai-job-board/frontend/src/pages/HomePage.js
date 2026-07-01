import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    { icon: '🤖', title: 'AI Match Scoring', desc: 'Get an instant compatibility score between your profile and any job listing.' },
    { icon: '✍️', title: 'Auto Cover Letters', desc: 'Generate tailored, compelling cover letters in seconds with OpenAI.' },
    { icon: '📊', title: 'Smart Rankings', desc: 'Employers see applicants ranked by AI fit score, not application order.' },
    { icon: '⚡', title: 'Real-time Updates', desc: 'Track your application status live from pending to hired.' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroInner}>
          <div className="badge badge-purple" style={{ marginBottom: 24, fontSize: 13 }}>✨ AI-Powered Recruiting</div>
          <h1 style={styles.heroTitle}>
            Find Your Dream Job<br />
            <span style={styles.heroAccent}>with AI on Your Side</span>
          </h1>
          <p style={styles.heroSubtitle}>
            TalentAI matches candidates to jobs using intelligent scoring,<br />
            and writes personalised cover letters that actually get read.
          </p>
          <div style={styles.heroBtns}>
            <Link to="/jobs" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Browse Jobs →
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
                Get Started Free
              </Link>
            )}
          </div>
          <div style={styles.heroStats}>
            {[['500+', 'Jobs Posted'], ['1200+', 'Candidates'], ['94%', 'Match Accuracy']].map(([num, label]) => (
              <div key={label} style={styles.stat}>
                <span style={styles.statNum}>{num}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="page-container">
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 32 }}>Why TalentAI?</h2>
        <p style={{ textAlign: 'center', color: '#888899', marginBottom: 48 }}>Built for modern hiring, powered by GPT</p>
        <div style={styles.features}>
          {features.map(f => (
            <div key={f.title} className="card" style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#888899', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={styles.cta}>
          <h2 style={{ marginBottom: 12 }}>Ready to find your next role?</h2>
          <p style={{ color: '#888899', marginBottom: 28 }}>Join thousands of candidates getting hired smarter.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {user?.role === 'employer' ? (
              <Link to="/post-job" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>Post a Job</Link>
            ) : (
              <Link to={user ? '/jobs' : '/register'} className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
                {user ? 'Browse Jobs' : 'Create Free Account'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: { position: 'relative', padding: '100px 24px 80px', textAlign: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%)' },
  heroGlow: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  heroInner: { position: 'relative', maxWidth: 700, margin: '0 auto' },
  heroTitle: { fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, fontFamily: 'Syne, sans-serif' },
  heroAccent: { background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubtitle: { fontSize: 18, color: '#888899', lineHeight: 1.6, marginBottom: 36 },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' },
  heroStats: { display: 'flex', gap: 48, justifyContent: 'center' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statNum: { fontSize: 28, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#6c63ff' },
  statLabel: { fontSize: 13, color: '#888899' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 80 },
  featureCard: { transition: 'transform 0.2s, border-color 0.2s' },
  featureIcon: { fontSize: 32, marginBottom: 16 },
  cta: { background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(255,101,132,0.05))', border: '1px solid #2a2a3a', borderRadius: 16, padding: '60px 32px', textAlign: 'center', marginBottom: 60 },
};
