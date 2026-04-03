import { projects } from '../server/projects.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // For Vercel, we'll assume all projects are built
    const projectsWithStatus = projects.map(p => ({
      ...p,
      built: true
    }));

    res.status(200).json({
      projects: projectsWithStatus,
      statuses: projectsWithStatus.map(p => ({
        id: p.id,
        status: 'available'
      }))
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
