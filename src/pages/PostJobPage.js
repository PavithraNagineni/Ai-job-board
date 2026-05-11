import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createJob, generateJobDescription } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JOB_TYPES = ['Full-time','Part-time','Contract','Internship','Remote'];

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiKeyPoints, setAiKeyPoints] = useState('');
  const [form, setForm] = useState({
    title:'', company: user?.company?.name || '', location:'', type:'Full-time',
    description:'', requirements:'', skills:'', salaryMin:'', salaryMax:'',
    currency:'USD', experience:'',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAIDescription = async () => {
    if (!form.title || !form.company) return toast.error('Enter job title and company first');
    setAiLoading(true);
    try {
      const { data } = await generateJobDescription({ title: form.title, company: form.company, keyPoints: aiKeyPoints || 'modern tech stack, collaborative team' });
      setForm({ ...form, description: data.description });
      toast.success('AI description generated!');
    } catch { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split('\n').filter(Boolean),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };
      const { data } = await createJob(payload);
      toast.success('Job posted successfully!');
      navigate(`/jobs/${data._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth:800 }}>
      <h1 style={{ marginBottom:6 }}>Post a Job</h1>
      <p style={{ color:'#888899',marginBottom:32 }}>Reach top AI-matched candidates instantly</p>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ marginBottom:20 }}>Basic Information</h3>
          <div style={s.row}>
            <div className="form-group" style={{ flex:2 }}>
              <label>Job Title *</label>
              <input name="title" className="form-control" placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Type *</label>
              <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={s.row}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Company *</label>
              <input name="company" className="form-control" placeholder="Company name" value={form.company} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Location *</label>
              <input name="location" className="form-control" placeholder="e.g. Bangalore / Remote" value={form.location} onChange={handleChange} required />
            </div>
          </div>
          <div style={s.row}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Experience Level</label>
              <input name="experience" className="form-control" placeholder="e.g. 2-4 years" value={form.experience} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Min Salary</label>
              <input name="salaryMin" type="number" className="form-control" placeholder="e.g. 80000" value={form.salaryMin} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Max Salary</label>
              <input name="salaryMax" type="number" className="form-control" placeholder="e.g. 120000" value={form.salaryMax} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <h3>Job Description *</h3>
            <div style={{ display:'flex',gap:10,alignItems:'center' }}>
              <input className="form-control" placeholder="Key points for AI (optional)" value={aiKeyPoints} onChange={e=>setAiKeyPoints(e.target.value)} style={{ width:240,fontSize:13 }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAIDescription} disabled={aiLoading}>
                {aiLoading ? <><span className="spinner" />Generating...</> : '🤖 AI Write'}
              </button>
            </div>
          </div>
          <textarea name="description" className="form-control" rows={10} placeholder="Describe the role, responsibilities, and what you're looking for..." value={form.description} onChange={handleChange} required style={{ minHeight:200 }} />
        </div>

        <div className="card" style={{ marginBottom:24 }}>
          <h3 style={{ marginBottom:20 }}>Requirements & Skills</h3>
          <div className="form-group">
            <label>Requirements (one per line)</label>
            <textarea name="requirements" className="form-control" rows={5} placeholder={"Bachelor's degree in CS or related\n3+ years of React experience\nStrong understanding of REST APIs"} value={form.requirements} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Required Skills (comma-separated)</label>
            <input name="skills" className="form-control" placeholder="React, Node.js, TypeScript, MongoDB, Docker" value={form.skills} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:16,fontSize:16 }} disabled={loading}>
          {loading ? <><span className="spinner" />Posting Job...</> : 'Post Job →'}
        </button>
      </form>
    </div>
  );
}

const s = { row:{ display:'flex',gap:16,flexWrap:'wrap' } };
