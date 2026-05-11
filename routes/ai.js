const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/match', protect, async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;
    if (!jobId || !resumeText)
      return res.status(400).json({ message: 'jobId and resumeText required' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const prompt = `You are an expert HR analyst. Analyze the fit between this candidate and job.

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${job.skills.join(', ')}
Requirements: ${job.requirements.join('\n')}
Experience: ${job.experience}

CANDIDATE RESUME:
${resumeText}

Respond in JSON format only:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence summary of fit>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "gaps": ["<gap1>", "<gap2>"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });
    const result = JSON.parse(completion.choices[0].message.content.trim());
    res.json(result);
  } catch (err) { res.status(500).json({ message: 'AI matching failed', error: err.message }); }
});

router.post('/cover-letter', protect, async (req, res) => {
  try {
    const { jobId, candidateName, resumeText, tone } = req.body;
    if (!jobId || !resumeText)
      return res.status(400).json({ message: 'jobId and resumeText required' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const toneInstruction = tone === 'formal'
      ? 'Write in a formal, professional tone.'
      : tone === 'creative'
      ? 'Write in a confident, creative, and memorable tone.'
      : 'Write in a professional yet warm and conversational tone.';

    const prompt = `You are an expert career coach. Write a compelling, personalised cover letter.
${toneInstruction}
JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Skills Required: ${job.skills.join(', ')}
CANDIDATE RESUME:
${resumeText}
${candidateName ? `Candidate Name: ${candidateName}` : ''}
Instructions:
- Do NOT use generic filler phrases
- Highlight specific skills from the resume that match the job
- Show genuine enthusiasm for the company/role
- Keep it under 350 words
- Start with a strong opening hook, not "I am writing to apply..."
- End with a clear call to action
Write only the cover letter body, no subject line or date.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 700,
    });
    res.json({ coverLetter: completion.choices[0].message.content.trim() });
  } catch (err) { res.status(500).json({ message: 'Cover letter generation failed', error: err.message }); }
});

router.post('/job-description', protect, async (req, res) => {
  try {
    const { title, company, keyPoints } = req.body;
    const prompt = `Write a professional, attractive job description for the following role.
Role: ${title}
Company: ${company}
Key Points: ${keyPoints}
Include:
- Brief company intro (1-2 sentences)
- Role overview (2-3 sentences)
- Key responsibilities (5-6 bullet points)
- Requirements (5-6 bullet points)
- Nice-to-haves (2-3 bullet points)
Keep it concise, compelling, and bias-free.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 800,
    });
    res.json({ description: completion.choices[0].message.content.trim() });
  } catch (err) { res.status(500).json({ message: 'Job description generation failed', error: err.message }); }
});

module.exports = router;
