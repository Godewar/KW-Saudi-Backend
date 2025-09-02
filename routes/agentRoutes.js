import express from 'express';
import { syncAgentsFromKWPeople, syncAgentsFromMultipleKWPeople, getFilteredAgents, getLeadsFromAgents, createLead, createAgent, updateAgent, deleteAgent } from '../controllers/agentController.js';

const router = express.Router();

router.get('/agent/:org_id', syncAgentsFromKWPeople);
router.get('/agents/merge', getFilteredAgents);

// Leads endpoints
router.get('/leads', getLeadsFromAgents);

// Form submission endpoint
router.post('/leads', createLead);

// CRUD operations for agents/leads
router.post('/agents', createAgent);
router.put('/leads/:id', updateAgent);
router.delete('/leads/:id', deleteAgent);

export default router;