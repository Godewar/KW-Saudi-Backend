import express from 'express';
import {
  createOrUpdateAgent,
  getAllAgents,
   getAgentBySlug,
  
 deleteAgentBySlug
} from '../controllers/agentController.js';

const router = express.Router();
import upload  from '../middlewares/upload.js';

// Create agent (user registration style)
// router.post('/users/register', registerAgent);
router.post('/user', upload.single('profileImage'), createOrUpdateAgent);

// Read all agents
router.get('/users', getAllAgents);

// Read one agent by slug
router.get('/user/:slug', getAgentBySlug);

// Update agent by slug
// router.put('/user/:slug', updateAgent);

// Delete agent by slug
router.delete('/user/:slug', deleteAgentBySlug);

export default router;
