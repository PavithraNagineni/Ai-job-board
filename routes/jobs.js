const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, employerOnly } = require('../middleware/auth');

router.get('/employer/mine', protect, employerOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { search, type, location, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    if (search) query.$text = { $search: search };
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query).populate('postedBy', 'name company').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(query),
    ]);
    res.json({ jobs, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email company');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, employerOnly, async (req, res) => {
  try {
    const { title, company, location, type, description, requirements, skills, salaryMin, salaryMax, currency, experience } = req.body;
    const job = await Job.create({
      title, company, location, type, description,
      requirements: requirements || [], skills: skills || [],
      salaryMin, salaryMax, currency, experience, postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    Object.assign(job, req.body);
    const updated = await job.save();
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
