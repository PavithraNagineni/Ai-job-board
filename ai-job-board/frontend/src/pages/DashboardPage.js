import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyJobs, getJobApplications, updateApplicationStatus, deleteJob } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'badge-yellow', reviewing: 'badge-purple', shortlisted: 'badge-green',
  rejected: 'badge-red', hired: 'badge-green',
};

function ApplicantModal({ jobId, jobTitle, onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobApplications(jobId)
      .then(r => setApplications(r.data))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, { status });
      setApplications(apps => apps.map(a => a._id === appId ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Applicants for "{jobTitle}"</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        {loading ? <div style={{ textAlign:'center', padding: 40 }}><div className="spinner" /></div>
          : applications.length === 0 ? <p style={{ color:'#888899', padding: 24 }}>No applicants yet.</p>
          : applications.map(app => (
            <div key={app._id} style={styles.appRow}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{app.applicant?.name}</p>
                <p style={{ color:'#888899', fontSize: 13 }}>{app.applicant?.email}</p>
                {app.aiMatchScore > 0 && (
                  <span style={{ fontSize: 13, color: app.aiMatchScore >= 75 ? '#22c55e' : app.aiMatchScore >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                    AI Match: {app.aiMatchScore}%
                  </span>
                )}
              </div>
              <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
                <span className={`badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                <select className="form-control" value={app.status} onChange={e => handleStatus(app._id, e.target.value)}
                  style={{ width: 140, fontSize: 13, padding: '5px 10px' }}>
                  {['pending','reviewing','shortlisted','rejected','hired'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { id, title }

  useEffect(() => {
    if (user?.role !== 'employer') { navigate('/'); return; }
    getMyJobs().then(r => setJobs(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      setJobs(jobs.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Delete failed'); }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);

  return (
    <div className="page-container">
      <div style={styles.header}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Employer Dashboard</h1>
          <p style={{ color:'#888899' }}>Welcome back, {user?.name}</p>
        </div>
        <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label:'Active Jobs', value: jobs.filter(j=>j.isActive).length, icon:'💼' },
          { label:'Total Applicants', value: totalApplicants, icon:'👥' },
          { label:'Total Jobs Posted', value: jobs.length, icon:'📋' },
        ].map(s => (
          <div key={s.label} className="card" style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statNum}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs table */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Your Job Listings</h3>
        {loading ? <div style={{ textAlign:'center', padding: 40 }}><div className="spinner" style={{ width:36, height:36 }} /></div>
          : jobs.length === 0 ? (
            <div style={{ textAlign:'center', padding: 48, color:'#888899' }}>
              <p style={{ marginBottom: 16 }}>No jobs posted yet.</p>
              <Link to="/post-job" className="btn btn-primary">Post Your First Job</Link>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Job Title</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Applicants</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Posted</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job._id} style={styles.tr}>
                      <td style={styles.td}>
                        <Link to={`/jobs/${job._id}`} style={{ color:'#e8e8f0', fontWeight: 500 }}>{job.title}</Link>
                      </td>
                      <td style={styles.td}><span className="badge badge-purple">{job.type}</span></td>
                      <td style={styles.td}><span style={{ color:'#888899', fontSize:13 }}>{job.location}</span></td>
                      <td style={styles.td}>
                        <button onClick={() => setSelected({ id: job._id, title: job.title })}
                          style={styles.appBtn}>{job.applicantCount} view</button>
                      </td>
                      <td style={styles.td}><span className={`badge ${job.isActive ? 'badge-green' : 'badge-gray'}`}>{job.isActive ? 'Active' : 'Closed'}</span></td>
                      <td style={styles.td}><span style={{ color:'#888899', fontSize:13 }}>{new Date(job.createdAt).toLocaleDateString()}</span></td>
                      <td style={styles.td}>
                        <div style={{ display:'flex', gap: 8 }}>
                          <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">View</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {selected && <ApplicantModal jobId={selected.id} jobTitle={selected.title} onClose={() => setSelected(null)} />}
    </div>
  );
}

const styles = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 32, flexWrap:'wrap', gap: 16 },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 28 },
  statCard: { textAlign:'center', padding: 24 },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statNum: { fontSize: 36, fontWeight: 800, fontFamily:'Syne, sans-serif', color:'#6c63ff', marginBottom: 4 },
  statLabel: { color:'#888899', fontSize: 14 },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { borderBottom:'1px solid #2a2a3a' },
  th: { padding:'10px 16px', textAlign:'left', fontSize:13, color:'#888899', fontWeight:600, whiteSpace:'nowrap' },
  tr: { borderBottom:'1px solid #1c1c26', transition:'background 0.15s' },
  td: { padding:'14px 16px', fontSize:14, verticalAlign:'middle' },
  appBtn: { background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.3)', color:'#6c63ff', borderRadius:6, padding:'4px 12px', fontSize:13, cursor:'pointer', fontWeight:600 },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 },
  modal: { background:'#13131a', border:'1px solid #2a2a3a', borderRadius:16, width:'100%', maxWidth:680, maxHeight:'80vh', overflowY:'auto', padding: 28 },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 },
  closeBtn: { background:'transparent', border:'none', color:'#888899', fontSize:20, cursor:'pointer', lineHeight:1 },
  appRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #1c1c26', gap: 16, flexWrap:'wrap' },
};
