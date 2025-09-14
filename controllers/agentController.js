import axios from 'axios';

// Fetch agents for a specific organization
export const syncAgentsFromKWPeople = async (req, res) => {
  try {
    const org_id = req.params.org_id;
    const activeFilter = req.query.active;

    if (!org_id) {
      return res.status(400).json({ success: false, message: 'Missing route param: org_id' });
    }

    const headers = {
      Authorization: 'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
      Accept: 'application/json',
    };
    const baseURL = `https://partners.api.kw.com/v2/listings/orgs/${org_id}/people`;

    let allPeople = [];
    let offset = 0;
    const apiLimit = req.query.limit ? Number(req.query.limit) : 30; // Default limit is 30
    let totalCount = 0;

    do {
      const url = `${baseURL}?page[offset]=${offset}&page[limit]=${apiLimit}`;
      console.log(`Fetching data from URL: ${url}`); // Debug log

      const response = await axios.get(url, { headers });

      // Extract the agents data from the response
      const peoplePage = response.data?.data || [];
      console.log(`Fetched ${peoplePage.length} agents from API`); // Debug log

      // Add the fetched agents to the allPeople array
      allPeople = allPeople.concat(peoplePage);

      // Get the total count of agents from the API response (only on the first request)
      if (offset === 0) {
        totalCount = response.data?.meta?.total || peoplePage.length;
        console.log(`Total agents reported by API: ${totalCount}`); // Debug log
      }

      // Increment the offset to fetch the next page
      offset += apiLimit;
    } while (offset < totalCount); // Continue until all agents are fetched

    // Apply the active filter if provided
    if (activeFilter !== undefined) {
      const isActive = activeFilter === 'true';
      allPeople = allPeople.filter(p => (p.active !== false) === isActive);
    }

    console.log(`Total agents after filtering: ${allPeople.length}`); // Debug log

    // Return the fetched agents
    res.status(200).json({
      success: true,
      org_id,
      total: allPeople.length,
      data: allPeople,
    });
  } catch (error) {
    console.error('KW People Sync Error:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
      error: error.message,
    });
  }
};

// Fetch agents from multiple organizations
export const syncAgentsFromMultipleKWPeople = async (req, res) => {
  try {
    const orgIds = ['50449', '2414288']; // List of organization IDs
    const activeFilter = req.query.active;
    const agentId = req.query.id; // Optional agent ID to filter


    let allPeople = [];

    for (const org_id of orgIds) {
      const headers = {
        Authorization: 'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
        Accept: 'application/json',
      };
      const baseURL = `https://partners.api.kw.com/v2/listings/orgs/${org_id}/people`;

      let offset = 0;
      const apiLimit = req.query.limit ? Number(req.query.limit) : 30; // Default limit is 30
      let totalCount = 0;

      do {
        const url = `${baseURL}?page[offset]=${offset}&page[limit]=${apiLimit}`;
        console.log(`Fetching data from URL: ${url}`); // Debug log

        const response = await axios.get(url, { headers });

        // Extract the agents data from the response
        const peoplePage = response.data?.data || [];
        console.log(`Fetched ${peoplePage.length} agents from API for org_id ${org_id}`); // Debug log

        // Add the fetched agents to the allPeople array
        allPeople = allPeople.concat(peoplePage);

        // Get the total count of agents from the API response (only on the first request)
        if (offset === 0) {
          totalCount = response.data?.meta?.total || peoplePage.length;
          console.log(`Total agents reported by API for org_id ${org_id}: ${totalCount}`); // Debug log
        }

        // Increment the offset to fetch the next page
        offset += apiLimit;
      } while (offset < totalCount); // Continue until all agents are fetched
    }

    // Apply the active filter if provided
    if (activeFilter !== undefined) {
      const isActive = activeFilter === 'true';
      allPeople = allPeople.filter(p => (p.active !== false) === isActive);
    }

    console.log(`Total agents after filtering: ${allPeople.length}`); // Debug log

    // Return the fetched agents
    res.status(200).json({
      success: true,
      org_ids: orgIds,
      total: allPeople.length,
      data: allPeople,
    });
  } catch (error) {
    console.error('KW People Sync Error:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents from multiple orgs',
      error: error.message,
    });
  }
};

// Get filtered agents with pagination
export const getFilteredAgents = async (req, res) => {
  try {
    const { name, marketCenter, city, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (name) {
      filter.fullName = { $regex: name, $options: 'i' };
    }
    if (marketCenter && marketCenter !== "MARKET CENTER") {
      filter.marketCenter = { $regex: `^${marketCenter}$`, $options: 'i' };
    }
    if (city && city !== "CITY" && city !== "RESET_ALL") {
      filter.city = { $regex: `^${city}$`, $options: 'i' };
    }

    const agents = await Agent.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${agents.length} agents`);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Agent.countDocuments(filter);

    // Transform agents into leads format with different formTypes
    const leads = agents.map(agent => {
      // Determine formType based on marketCenter or other criteria
      let formType = 'contact-us'; // default
      if (agent.marketCenter && agent.marketCenter.includes('Jasmin')) {
        formType = 'jasmin';
      } else if (agent.marketCenter && agent.marketCenter.includes('Jeddah')) {
        formType = 'jeddah';
      } else if (agent.marketCenter && agent.marketCenter.includes('Franchise')) {
        formType = 'franchise';
      }

      return {
        _id: agent._id,
        fullName: agent.fullName,
        firstName: agent.fullName?.split(' ')[0] || '',
        lastName: agent.lastName || agent.fullName?.split(' ').slice(1).join(' ') || '',
        email: agent.email,
        mobileNumber: agent.phone,
        city: agent.city,
        formType: formType,
        message: `Agent from ${agent.marketCenter || 'KW Saudi Arabia'}`,
        createdAt: agent.createdAt,
        // Additional fields for different tabs
        addressTo: agent.city || '',
        surname: agent.lastName || '',
        companyName: agent.marketCenter || '',
        dob: agent.createdAt, // Use creation date as placeholder
        educationStatus: 'Professional',
        province: agent.city || '',
        hearAboutUs: 'KW Platform',
        promotionalConsent: true,
        personalDataConsent: true,
        imageUrl: agent.photo || '',
        isAgent: true // Flag to identify this is an agent, not a form submission
      };
    });

    res.status(200).json({
      success: true,
      count: agents.length,
      total,
      page: parseInt(page),
      data: agents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get leads data from agents for the frontend
export const getLeadsFromAgents = async (req, res) => {
  try {
    console.log('getLeadsFromAgents called');
    
    // Get all agents from database
    const agents = await Agent.find({}).sort({ createdAt: -1 });
    console.log(`Found ${agents.length} agents`);

    // Transform agents into leads format with different formTypes
    const leads = agents.map(agent => {
      // Determine formType based on marketCenter or other criteria
      let formType = 'contact-us'; // default
      if (agent.marketCenter && agent.marketCenter.includes('Jasmin')) {
        formType = 'jasmin';
      } else if (agent.marketCenter && agent.marketCenter.includes('Jeddah')) {
        formType = 'jeddah';
      } else if (agent.marketCenter && agent.marketCenter.includes('Franchise')) {
        formType = 'franchise';
      }
      
      return {
        _id: agent._id,
        fullName: agent.fullName,
        firstName: agent.fullName?.split(' ')[0] || '',
        lastName: agent.lastName || agent.fullName?.split(' ').slice(1).join(' ') || '',
        email: agent.email,
        mobileNumber: agent.phone,
        city: agent.city,
        formType: formType,
        message: `Agent from ${agent.marketCenter || 'KW Saudi Arabia'}`,
        createdAt: agent.createdAt,
        // Additional fields for different tabs
        addressTo: agent.city || '',
        surname: agent.lastName || '',
        companyName: agent.marketCenter || '',
        dob: agent.createdAt, // Use creation date as placeholder
        educationStatus: 'Professional',
        province: agent.city || '',
        hearAboutUs: 'KW Platform',
        promotionalConsent: true,
        personalDataConsent: true,
        imageUrl: agent.photo || '',
        isAgent: true // Flag to identify this is an agent, not a form submission
      };
    });

    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads from agents:', err);
    res.status(500).json({       error: 'Failed to fetch leads',      message: err.message     });
  }
};

// Get agent by ID
export const getAgentById = async (req, res) => {
  try {
    const agentId = req.params.id;

    if (!agentId) {
      return res.status(400).json({ success: false, message: 'Agent ID is required' });
    }

    // List of organization IDs to search in
    const orgIds = ['50449', '2414288']; // Add all relevant org IDs here
    const headers = {
      Authorization: 'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
      Accept: 'application/json',
    };

    let agent = null;

    // Iterate through all organization IDs to find the agent
    for (const org_id of orgIds) {
      const baseURL = `https://partners.api.kw.com/v2/listings/orgs/${org_id}/people`;
      const url = `${baseURL}?filter[id]=${agentId}`;
      console.log(`Fetching agent data from URL: ${url}`); // Debug log

      const response = await axios.get(url, { headers });

      // Check if the agent exists in the current organization
      agent = response.data?.data?.find((a) => a.kw_uid === parseInt(agentId));
      if (agent) {
        console.log(`Agent found in org_id: ${org_id}`); // Debug log
        break; // Exit the loop once the agent is found
      }
    }

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error fetching agent by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent',
      error: error.message,
    });
  }
};





