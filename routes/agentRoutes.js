import express from 'express';
import { syncAgentsFromKWPeople, getFilteredAgents, syncAgentsFromMultipleKWPeople, getAgentById} from '../controllers/agentController.js';// filepath: e:\KW-Admin-New-Dashboard-main\KW-Admin-New-Dashboard-main\admin-backend\KW-Admin-Backend-master\controllers\agentController.js
export const getPaginatedAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch agents from an external API or database
    const agents = []; // Replace with actual data fetching logic
    const total = agents.length;

    const paginatedAgents = agents.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      count: paginatedAgents.length,
      data: paginatedAgents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const router = express.Router();


// Paginated agents endpoint (limit & offset)
// 
router.get('/agent/:org_id', syncAgentsFromKWPeople);
router.get('/agents/merge', syncAgentsFromMultipleKWPeople);
// router.get('/agents/merge', getFilteredAgents);
router.get('/agents/:id', getAgentById);


export default router;