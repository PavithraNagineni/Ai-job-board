const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, employerOnly, candidateOnly } = require('../middleware/auth');

// POST /api/applications - apply for a job (candidate)
router.post('/', protect, candidateOnly, async (req, res) => {
  try {
    const { jobId, coverLetter, aiGeneratedCoverLetter, aiMatchScore, aiMatchSummary } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      aiGeneratedCoverLetter,
      aiMatchScore: aiMatchScore || 0,
      aiMatchSummary: aiMatchSummary || '',
    });

    // Increment applicant count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    await application.populate('job', 'title company location');
    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already applied to this job' });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/mine - candidate's applications
router.get('/mine', protect, candidateOnly, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location type salaryMin salaryMax')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/job/:jobId - employer sees all applicants for a job
router.get('/job/:jobId', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email profile')
      .sort({ aiMatchScore: -1 }); // Sort by AI match score descending
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/applications/:id/status - employer updates status
router.put('/:id/status', protect, employerOnly, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    application.status = req.body.status;
    if (req.body.notes) application.notes = req.body.notes;
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
