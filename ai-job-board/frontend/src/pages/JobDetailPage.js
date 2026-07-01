import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getJob, getMatchScore, generateCoverLetter, applyToJob } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [clTone, setClTone] = useState('professional');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [tab, setTab] = useState('overview'); // overview | apply

  useEffect(() => {
    getJob(id).then(r => { setJob(r.data); setLoading(false); }).catch(() => navigate('/jobs'));
  }, [id]);

  const handleGetMatch = async () => {
    if (!user) return navigate('/login');
    const resume = user.profile?.resumeText;
    if (!resume) return toast.error('Add your resume text in Profile settings first');
    setMatchLoading(true);
    try {
      const { data } = await getMatchScore({ jobId: id, resumeText: resume });
      setMatchResult(data);
    } catch { toast.error('AI matching failed'); }
    finally { setMatchLoading(false); }
  };

  const handleGenerateCL = async () => {
    if (!user) return navigate('/login');
    const resume = user.profile?.resumeText;
    if (!resume) return toast.error('Add your resume text in Profile settings first');
    setClLoading(true);
    try {
      const { data } = await generateCoverLetter({ jobId: id, resumeText: resume, candidateName: user.name, tone: clTone });
      setCoverLetter(data.coverLetter);
    } catch { toast.error('Cover letter generation failed'); }
    finally { setClLoading(false); }
  };

  const handleApply = async () => {
    if (!user) return navigate('/login');
    setApplying(true);
    try {
      await applyToJob({
        jobId: id,
        coverLetter,
        aiGeneratedCoverLetter: coverLetter,
        aiMatchScore: matchResult?.score || 0,
        aiMatchSummary: matchResult?.summary || '',
      });
      setApplied(true);
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setApplying(false); }
  };

  const scoreColor = (s) => s >= 75 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><div className="spinner" style={{ width:40, height:40 }} /></div>;
  if (!job) return null;

  const salary = job.salaryMin && job.salaryMax
    ? `$${(job.salaryMin/1000).toFixed(0)}k – $${(job.salaryMax/1000).toFixed(0)}k/yr`
    : 'Salary not listed';

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 6 }}>{job.title}</h1>
            <p style={{ color: '#888899', fontSize: 16, marginBottom: 12 }}>{job.company} · {job.location}</p>
            <div style={{ display:'flex', gap: 10, flexWrap:'wrap' }}>
              <span className="badge badge-purple">{job.type}</span>
              {job.experience && <span className="badge badge-gray">{job.experience}</span>}
              <span className="badge badge-green">{salary}</span>
            </div>
          </div>
          {user?.role === 'candidate' && !applied && (
            <button className="btn btn-primary" onClick={() => setTab('apply')} style={{ flexShrink: 0, padding: '12px 28px' }}>
              Apply Now →
            </button>
          )}
          {applied && <span className="badge badge-green" style={{ padding: '10px 20px', fontSize: 14 }}>✓ Applied</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'apply'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t === 'overview' ? '📋 Overview' : '🚀 Apply with AI'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={styles.cols}>
          <div style={{ flex: 2 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>About the Role</h3>
              <p style={{ color: '#ccc', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</p>
            </div>
            {job.requirements?.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 16 }}>Requirements</h3>
                <ul style={styles.list}>{job.requirements.map((r,i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12 }}>Skills</h4>
              <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
                {job.skills.map(s => <span key={s} style={styles.skillTag}>{s}</span>)}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>Details</h4>
              {[['📍', 'Location', job.location],['💼', 'Type', job.type],['📅', 'Experience', job.experience || 'Any'],['👥', 'Applicants', job.applicantCount]].map(([icon, label, val]) => (
                <div key={label} style={styles.detail}><span style={{ color:'#888899' }}>{icon} {label}</span><span style={{ fontWeight: 500 }}>{val}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'apply' && user?.role === 'candidate' && (
        <div>
          {/* AI Match */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8 }}>🤖 AI Match Score</h3>
            <p style={{ color:'#888899', fontSize: 14, marginBottom: 16 }}>See how well your profile matches this role. Add your resume in Profile first.</p>
            {!matchResult ? (
              <button className="btn btn-primary" onClick={handleGetMatch} disabled={matchLoading}>
                {matchLoading ? <><span className="spinner" />Analysing...</> : 'Get Match Score'}
              </button>
            ) : (
              <div style={styles.matchResult}>
                <div className="score-ring" style={{ background: `rgba(${matchResult.score>=75?'34,197,94':matchResult.score>=50?'245,158,11':'239,68,68'},0.15)`, color: scoreColor(matchResult.score), border: `2px solid ${scoreColor(matchResult.score)}` }}>
                  {matchResult.score}%
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ marginBottom: 10, lineHeight: 1.6 }}>{matchResult.summary}</p>
                  <div style={{ display:'flex', gap: 20 }}>
                    <div>
                      <p style={{ color:'#22c55e', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>✓ Strengths</p>
                      {matchResult.strengths?.map(s => <p key={s} style={{ fontSize: 13, color:'#ccc', marginBottom: 4 }}>• {s}</p>)}
                    </div>
                    <div>
                      <p style={{ color:'#f59e0b', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>△ Gaps</p>
                      {matchResult.gaps?.map(g => <p key={g} style={{ fontSize: 13, color:'#ccc', marginBottom: 4 }}>• {g}</p>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cover Letter Generator */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8 }}>✍️ AI Cover Letter</h3>
            <p style={{ color:'#888899', fontSize: 14, marginBottom: 16 }}>Generate a personalised cover letter using your resume and this job's details.</p>
            <div style={{ display:'flex', gap: 12, marginBottom: 16, alignItems:'center' }}>
              <label style={{ fontSize: 14, color:'#888899' }}>Tone:</label>
              {['professional', 'formal', 'creative'].map(t => (
                <button key={t} type="button" onClick={() => setClTone(t)}
                  style={{ ...styles.toneBtn, ...(clTone===t ? styles.toneBtnActive : {}) }}>
                  {t}
                </button>
              ))}
              <button className="btn btn-primary btn-sm" onClick={handleGenerateCL} disabled={clLoading}>
                {clLoading ? <><span className="spinner" />Generating...</> : 'Generate'}
              </button>
            </div>
            {coverLetter && (
              <textarea className="form-control" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ minHeight: 220, lineHeight: 1.7 }} />
            )}
          </div>

          {/* Submit */}
          <div className="card">
            <h3 style={{ marginBottom: 8 }}>Submit Application</h3>
            <p style={{ color:'#888899', fontSize: 14, marginBottom: 16 }}>Review your cover letter above, then submit.</p>
            <button className="btn btn-primary" onClick={handleApply} disabled={applying || applied} style={{ padding: '12px 32px' }}>
              {applying ? <><span className="spinner" />Submitting...</> : applied ? '✓ Applied' : 'Submit Application →'}
            </button>
          </div>
        </div>
      )}

      {tab === 'apply' && !user && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color:'#888899', marginBottom: 20 }}>Sign in to apply for this job</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In to Apply</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 20, flexWrap:'wrap' },
  tabs: { display:'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #2a2a3a', paddingBottom: 0 },
  tab: { padding:'10px 20px', background:'transparent', border:'none', color:'#888899', fontWeight:600, fontSize:14, cursor:'pointer', borderBottom:'2px solid transparent', transition:'all 0.2s' },
  tabActive: { color:'#6c63ff', borderBottom:'2px solid #6c63ff' },
  cols: { display:'flex', gap: 20, alignItems:'flex-start', flexWrap:'wrap' },
  list: { paddingLeft: 20, color:'#ccc', lineHeight: 2, fontSize: 14 },
  skillTag: { background:'#1c1c26', border:'1px solid #2a2a3a', borderRadius:6, padding:'4px 12px', fontSize:13, color:'#888899' },
  detail: { display:'flex', justifyContent:'space-between', fontSize: 14, marginBottom: 12 },
  matchResult: { display:'flex', gap: 20, alignItems:'flex-start', padding: 16, background:'#1c1c26', borderRadius: 10 },
  toneBtn: { padding:'5px 14px', borderRadius:6, border:'1px solid #2a2a3a', background:'transparent', color:'#888899', fontSize:13, cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize' },
  toneBtnActive: { border:'1px solid #6c63ff', color:'#6c63ff', background:'rgba(108,99,255,0.1)' },
};
