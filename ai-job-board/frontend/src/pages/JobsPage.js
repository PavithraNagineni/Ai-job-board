import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../utils/api';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

function JobCard({ job }) {
  const salary = job.salaryMin && job.salaryMax
    ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
    : 'Salary not listed';

  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);

  return (
    <Link to={`/jobs/${job._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card" style={styles.jobCard}>
        <div style={styles.jobHeader}>
          <div>
            <h3 style={{ marginBottom: 4, fontSize: 17 }}>{job.title}</h3>
            <p style={{ color: '#888899', fontSize: 14 }}>{job.company} · {job.location}</p>
          </div>
          <span className={`badge badge-purple`}>{job.type}</span>
        </div>
        <p style={styles.desc}>{job.description.slice(0, 120)}...</p>
        <div style={styles.skills}>
          {job.skills.slice(0, 5).map(s => <span key={s} style={styles.skill}>{s}</span>)}
        </div>
        <div style={styles.jobFooter}>
          <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>{salary}</span>
          <span style={{ color: '#888899', fontSize: 13 }}>
            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`} · {job.applicantCount} applicants
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await getJobs({ search, type, location, page, limit: 9 });
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchJobs(); };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: 8 }}>Browse Jobs</h1>
      <p style={{ color: '#888899', marginBottom: 32 }}>{total} opportunities available</p>

      {/* Filters */}
      <form onSubmit={handleSearch} style={styles.filters}>
        <input className="form-control" placeholder="🔍 Search title, skill, company..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 2 }} />
        <input className="form-control" placeholder="📍 Location" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1 }} />
        <select className="form-control" value={type} onChange={e => setType(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Types</option>
          {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-outline" onClick={() => { setSearch(''); setType(''); setLocation(''); setPage(1); setTimeout(fetchJobs, 100); }}>Clear</button>
      </form>

      {/* Jobs grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : jobs.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3>No jobs found</h3>
          <p style={{ color: '#888899' }}>Try adjusting your search filters</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {jobs.map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={styles.pagination}>
          <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ color: '#888899', fontSize: 14 }}>Page {page} of {pages}</span>
          <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  filters: { display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginBottom: 40 },
  jobCard: { transition: 'all 0.2s', cursor: 'pointer', height: '100%' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  desc: { color: '#888899', fontSize: 14, lineHeight: 1.6, marginBottom: 14 },
  skills: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  skill: { background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#888899' },
  jobFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  empty: { textAlign: 'center', padding: '80px 0' },
  pagination: { display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
};
