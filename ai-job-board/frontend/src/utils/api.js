import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : '/api'
});

// Add request interceptor to automatically attach authorization header
API.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('jobboard_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Jobs
export const getJobs = (params) => API.get('/jobs', { params });
export const getJob = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/employer/mine');

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Applications
export const applyToJob = (data) => API.post('/applications', data);
export const getMyApplications = () => API.get('/applications/mine');
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, data) => API.put(`/applications/${id}/status`, data);

// AI
export const getMatchScore = (data) => API.post('/ai/match', data);
export const generateCoverLetter = (data) => API.post('/ai/cover-letter', data);
export const generateJobDescription = (data) => API.post('/ai/job-description', data);
