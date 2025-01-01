// backend/routes/business.js
const express = require('express');
const router = express.Router();
const { Issue, Project } = require('../model');
const { isAuth } = require('../middleware');
// Get dashboard statistics
router.get('/dashboard/:id', isAuth, async (req, res) => {
  try {
    // Use MongoDB aggregation to calculate metrics from all projects
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          energyUsage: { $sum: "$sustainabilityMetrics.energyUsage.current" },
          carbonFootprint: { $sum: "$sustainabilityMetrics.carbonFootprint.current" },
          costSavings: { $sum: "$sustainabilityMetrics.costSavings.netSavings" },
          sustainabilityScore: { $avg: "$sustainabilityMetrics.sustainabilityScore.overallScore" }
        }
      },
      {
        $project: {
          _id: 0,
          energyUsage: 1,
          carbonFootprint: 1,
          costSavings: 1,
          sustainabilityScore: 1
        }
      }
    ]);

    // If no projects exist, return default values
    const defaultStats = {
      energyUsage: 0,
      carbonFootprint: 0,
      costSavings: 0,
      sustainabilityScore: 0
    };

    res.status(200).json({ 
      stats: stats[0] || defaultStats 
    });
  } catch (error) {
    console.error('Dashboard stats calculation error:', error);
    res.status(500).json({ 
      message: 'Error calculating dashboard statistics',
      error: error.message 
    });
  }
});

// Get recent projects
router.get('/recent-projects', isAuth, async (req, res) => {
  try {
    const projects = await Project.find({ business: req.userId })
      .sort({ createdAt: -1 })
      .limit(4);
    
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent projects' });
  }
});

router.get('/projects', isAuth, async (req, res) => {
  try {
    const projects = await Project.find({ business: req.userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Create new project
router.post('/projects', isAuth, async (req, res) => {
  try {
    const project = new Project(req.body)
    await project.save();
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
    console.log(error)
  }
});

// Update project
router.put('/projects/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Issue routes
router.get('/issues/:id', isAuth, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate({
        path: 'project',
        populate: { path: 'business' }
      })
      .find({ 'project.business': req.params.id });
    res.status(200).json({ issues });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues' });
  }
});

router.put('/issues/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ issue });
  } catch (error) {
    res.status(500).json({ message: 'Error updating issue' });
  }
});

module.exports = router;