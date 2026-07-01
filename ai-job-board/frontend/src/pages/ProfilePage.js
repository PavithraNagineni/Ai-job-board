import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills?.join(', ') || '',
    experience: user?.profile?.experience || '',
    resumeText: user?.profile?.resumeText || '',
    location: user?.profile?.location || '',
    linkedIn: user?.profile?.linkedIn || '',
    github: user?.profile?.github || '',
    companyName: user?.company?.name || '',
    companyWebsite: user?.company?.website || '',
    companyDesc: user?.company?.description || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        profile: {
          bio: form.bio,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          experience: form.experience,
          resumeText: form.resumeText,
          location: form.location,
          linkedIn: form.linkedIn,
          github: form.github,
        },
      };
      if (user?.role === 'employer') {
        payload.company = { name: form.companyName, website: form.companyWebsite, description: form.companyDesc };
      }
      const { data } = await updateProfile(payload);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <h1 style={{ marginBottom: 6 }}>Your Profile</h1>
      <p style={{ color:'#888899', marginBottom: 32 }}>Keep your profile updated for better AI matching</p>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 20 }}>Personal Info</h3>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Full Name</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Location</label>
              <input name="location" className="form-control" placeholder="City, Country" value={form.location} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" className="form-control" rows={3} placeholder="Brief professional summary..." value={form.bio} onChange={handleChange} />
          </div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>LinkedIn URL</label>
              <input name="linkedIn" className="form-control" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>GitHub URL</label>
              <input name="github" className="form-control" placeholder="https://github.com/..." value={form.github} onChange={handleChange} />
            </div>
          </div>
        </div>

        {user?.role === 'candidate' && (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>Skills & Experience</h3>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input name="skills" className="form-control" placeholder="Python, React, Node.js, Docker, SQL..." value={form.skills} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input name="experience" className="form-control" placeholder="e.g. 2 years, Fresher, 5+ years" value={form.experience} onChange={handleChange} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Resume Text</h3>
              <p style={{ color:'#888899', fontSize: 13, marginBottom: 16 }}>
                ⚠️ This is used by the AI for match scoring and cover letter generation. Paste your full resume as plain text.
              </p>
              <textarea name="resumeText" className="form-control" rows={12} placeholder="Paste your complete resume text here — skills, experience, projects, education..." value={form.resumeText} onChange={handleChange} style={{ minHeight: 260, fontSize: 13, lineHeight: 1.7 }} />
            </div>
          </>
        )}

        {user?.role === 'employer' && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 20 }}>Company Details</h3>
            <div className="form-group">
              <label>Company Name</label>
              <input name="companyName" className="form-control" value={form.companyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Company Website</label>
              <input name="companyWebsite" className="form-control" placeholder="https://yourcompany.com" value={form.companyWebsite} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Company Description</label>
              <textarea name="companyDesc" className="form-control" rows={4} value={form.companyDesc} onChange={handleChange} />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding:'13px 32px', fontSize:15 }}>
          {loading ? <><span className="spinner" />Saving...</> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

const styles = { row: { display:'flex', gap: 16, flexWrap:'wrap' } };
