const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: 'USD' },
    experience: { type: String, default: 'Any' }, // e.g. "0-2 years"
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search index
jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
