import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../utils/api';

const STATUS_BADGE = {
  pending: 'badge-yellow', reviewing: 'badge-purple', shortlisted: 'badge-green',
  rejected: 'badge-red', hired: 'badge-green',
};

const STATUS_ICON = { pending:'⏳', reviewing:'🔍', shortlisted:'⭐', rejected:'✕', hired:'🎉' };

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications().then(r => setApplications(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><div className="spinner" style={{ width:40, height:40 }} /></div>;

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <h1 style={{ marginBottom: 6 }}>My Applications</h1>
      <p style={{ color:'#888899', marginBottom: 32 }}>{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>

      {applications.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>No applications yet</h3>
          <p style={{ color:'#888899', marginBottom: 24 }}>Start applying to jobs to see them here</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs →</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
          {applications.map(app => {
            const job = app.job;
            const salary = job?.salaryMin && job?.salaryMax
              ? `$${(job.salaryMin/1000).toFixed(0)}k – $${(job.salaryMax/1000).toFixed(0)}k`
              : null;
            return (
              <div key={app._id} className="card" style={styles.appCard}>
                <div style={styles.left}>
                  <div style={{ marginBottom: 6 }}>
                    <Link to={`/jobs/${job?._id}`} style={{ fontWeight: 700, fontSize: 17, color:'#e8e8f0' }}>{job?.title}</Link>
                    <p style={{ color:'#888899', fontSize: 14, marginTop: 2 }}>{job?.company} · {job?.location}</p>
                  </div>
                  <div style={{ display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' }}>
                    {job?.type && <span className="badge badge-purple">{job.type}</span>}
                    {salary && <span style={{ color:'#22c55e', fontWeight:600, fontSize:13 }}>{salary}</span>}
                    {app.aiMatchScore > 0 && (
                      <span style={{ fontSize:13, fontWeight:700, color: app.aiMatchScore>=75?'#22c55e':app.aiMatchScore>=50?'#f59e0b':'#ef4444' }}>
                        AI Match: {app.aiMatchScore}%
                      </span>
                    )}
                  </div>
                  {app.aiMatchSummary && (
                    <p style={{ color:'#888899', fontSize:13, marginTop: 10, lineHeight:1.5 }}>{app.aiMatchSummary}</p>
                  )}
                </div>
                <div style={styles.right}>
                  <div style={{ textAlign:'right', marginBottom: 8 }}>
                    <span className={`badge ${STATUS_BADGE[app.status]}`} style={{ fontSize:13 }}>
                      {STATUS_ICON[app.status]} {app.status}
                    </span>
                  </div>
                  <p style={{ color:'#888899', fontSize:12 }}>Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  appCard: { display:'flex', justifyContent:'space-between', gap: 20, alignItems:'flex-start', flexWrap:'wrap' },
  left: { flex: 1 },
  right: { flexShrink: 0, textAlign:'right' },
};
