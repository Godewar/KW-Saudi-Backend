

import axios from 'axios';
import Agent from '../models/Agent.js';

export const syncAgentsFromKWPeople = async (req, res) => {
  try {
    // 1. Input: Org ID and filters
    const org_id = req.params.org_id;
    console.log('Requested org_id:', org_id);
    const activeFilter = req.query.active;
    const page = Number(req.query.page ?? 1);
    const perPage = req.query.limit ? Number(req.query.limit) : 50;

    if (!org_id) {
      return res.status(400).json({ success: false, message: 'Missing route param: org_id' });
    }

    // 2. Headers and base URL
    const headers = {
      Authorization: 'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
      Accept: 'application/json',
    };
    const baseURL = `https://partners.api.kw.com/v2/listings/orgs/${org_id}/people`;

    // 3. Fetch all pages (if API supports offset-based pagination)
    let allPeople = [];
    let offset = 0;
    const apiLimit = req.query.limit ? Number(req.query.limit) : undefined;
    let first = true;
    let totalCount = 0;

    do {
      let url = `${baseURL}?page[offset]=${offset}`;
      if (apiLimit !== undefined) url += `&page[limit]=${apiLimit}`;
      console.log('Calling KW API URL:', url);
      const response = await axios.get(url, { headers });
       console.log('KW People API Response:', JSON.stringify(response.data, null, 2));

      // Try to get people from different possible keys
      let peoplePage = [];
      if (Array.isArray(response.data?.people)) {
        peoplePage = response.data.people;
      } else if (Array.isArray(response.data?.results)) {
        peoplePage = response.data.results;
      } else if (Array.isArray(response.data?.data)) {
        peoplePage = response.data.data;
      } else {
        console.warn('KW API returned no recognizable people array.');
      }

      if (first) {
        totalCount = response.data?.pagination?.total ?? peoplePage.length;
        first = false;
      }

      if (!Array.isArray(peoplePage)) break;
      if (peoplePage.length === 0) {
        console.warn('KW API returned an empty people array for this page.');
      }
      allPeople = allPeople.concat(peoplePage);
      console.log("Total people received from KW so far:", allPeople.length);
      if (allPeople.length > 0) {
        console.log("First person sample:", allPeople[0]);
      }

      offset += apiLimit;
    } while (offset < totalCount);

    // 4. Filter by `active` if present
    if (activeFilter !== undefined) {
  const isActive = activeFilter === 'true';
  allPeople = allPeople.filter(p => (p.active !== false) === isActive);
  console.log(`After active filter (${isActive}):`, allPeople.length);
}

    // 5. If no people found, return early
    if (allPeople.length === 0) {
      console.warn('No agents found in KW API for org_id:', org_id);
      return res.status(200).json({
        success: true,
        message: 'No agents found in KW API for this org_id.',
        org_id,
        data: [],
        total: 0,
      });
    }

    // 6. Sync to DB
    const syncedAgents = [];
    for (const person of allPeople) {
      const {
        kw_uid,
         // <-- use this
        first_name,
        last_name,
        photo,
        email,
        phone,
        market_center_number,
        city,
        active,
        slug,
      } = person;

      if (!kw_uid || !first_name) {
        console.warn('Skipping person due to missing kw_uid or first_name:', person);
        continue;
      }

      const generatedSlug = slug || kw_uid.toString().toLowerCase();

      const agentData = {
        slug: generatedSlug,
        kwId: kw_uid,
        fullName: `${first_name} ${last_name || ''}`.trim(),
        lastName: last_name || '',
        email: email || '',
        phone: phone || '',
        marketCenter: market_center_number || '',
        city: city || '',
        active: active !== false,
        photo: photo || '',
      };

      try {
      const updatedAgent = await Agent.findOneAndUpdate(
        { slug: generatedSlug },
        agentData,
        { new: true, upsert: true, runValidators: true }
      );
      syncedAgents.push(updatedAgent);
      } catch (dbErr) {
        console.error('Error syncing agent to DB:', dbErr.message, agentData);
      }
    }

    // 7. Paginate response
    const paginated = syncedAgents.slice((page - 1) * perPage, page * perPage);

    // 8. Send response
    if (syncedAgents.length === 0) {
      console.warn('No agents were saved to the database for org_id:', org_id);
      return res.status(200).json({
        success: true,
        message: 'No agents were saved to the database for this org_id.',
        org_id,
        total: 0,
        page,
        per_page: perPage,
        count: 0,
        data: [],
      });
    }
    res.status(200).json({
      success: true,
     org_id,
      total: syncedAgents.length,
      page,
      per_page: perPage,
      count: paginated.length,
      data: paginated,
    });

  } catch (error) {
    console.error('KW People Sync Error:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync agents',
      error: error.message,
    });
  }
};

export const syncAgentsFromMultipleKWPeople = async (req, res) => {
  try {
    const orgIds = ['50449', '2414288'];
    const activeFilter = req.query.active;
    const page = Number(req.query.page ?? 1);
    const perPage = req.query.limit ? Number(req.query.limit) : 50;
    let allPeople = [];

    for (const org_id of orgIds) {
      const headers = {
        Authorization: 'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
        Accept: 'application/json',
      };
      const baseURL = `https://partners.api.kw.com/v2/listings/orgs/${org_id}/people`;
      let offset = 0;
      const apiLimit = req.query.limit ? Number(req.query.limit) : undefined;
      let first = true;
      let totalCount = 0;
      do {
        let url = `${baseURL}?page[offset]=${offset}`;
        if (apiLimit !== undefined) url += `&page[limit]=${apiLimit}`;
        const response = await axios.get(url, { headers });
        let peoplePage = [];
        if (Array.isArray(response.data?.people)) {
          peoplePage = response.data.people;
        } else if (Array.isArray(response.data?.results)) {
          peoplePage = response.data.results;
        } else if (Array.isArray(response.data?.data)) {
          peoplePage = response.data.data;
        }
        if (first) {
          totalCount = response.data?.pagination?.total ?? peoplePage.length;
          first = false;
        }
        if (!Array.isArray(peoplePage)) break;
        allPeople = allPeople.concat(peoplePage);
        offset += apiLimit;
      } while (offset < totalCount);
    }

    // Filter by active if present
    if (activeFilter !== undefined) {
      const isActive = activeFilter === 'true';
      allPeople = allPeople.filter(p => (p.active !== false) === isActive);
    }

    // Remove duplicates by slug (or kw_uid if slug missing)
    const seen = new Set();
    const uniquePeople = [];
    for (const person of allPeople) {
      const slug = person.slug || (person.kw_uid ? person.kw_uid.toString().toLowerCase() : undefined);
      if (slug && !seen.has(slug)) {
        seen.add(slug);
        uniquePeople.push(person);
      }
    }

    // Sync to DB
    const syncedAgents = [];
    for (const person of uniquePeople) {
      const {
        kw_uid,
        first_name,
        last_name,
        photo,
        email,
        phone,
        market_center_number,
        city,
        active,
        slug,
      } = person;
      if (!kw_uid || !first_name) continue;
      const generatedSlug = slug || kw_uid.toString().toLowerCase();
      const agentData = {
        slug: generatedSlug,
        kwId: kw_uid,
        fullName: `${first_name} ${last_name || ''}`.trim(),
        lastName: last_name || '',
        email: email || '',
        phone: phone || '',
        marketCenter: market_center_number || '',
        city: city || '',
        active: active !== false,
        photo: photo || '',
      };
      try {
        const updatedAgent = await Agent.findOneAndUpdate(
          { slug: generatedSlug },
          agentData,
          { new: true, upsert: true, runValidators: true }
        );
        syncedAgents.push(updatedAgent);
      } catch (dbErr) {
        // skip DB errors for now
      }
    }

    // Paginate response
    const paginated = syncedAgents.slice((page - 1) * perPage, page * perPage);
    res.status(200).json({
      success: true,
      org_ids: orgIds,
      total: syncedAgents.length,
      page,
      per_page: perPage,
      count: paginated.length,
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync agents from multiple orgs',
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

    console.log('Agent filter:', filter); // Debug log

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Agent.countDocuments(filter);
    const agents = await Agent.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      count: agents.length,
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
      
      // Transform to lead format
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
    
    console.log(`Transformed ${leads.length} agents to leads`);
    
    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads from agents:', err);
    res.status(500).json({ 
      error: 'Failed to fetch leads',
      message: err.message 
    });
  }
};

// Create a new lead from form submission
export const createLead = async (req, res) => {
  try {
    console.log('Creating new lead from form submission:', req.body);
    
    const {
      fullName,
      email,
      phone,
      mobileNumber,
      city,
      message,
      formType,
      purpose,
      appointmentDate,
      appointmentTime,
      termsAccepted,
      notes,
      yourName
    } = req.body;

    // Validate required fields based on form type
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      });
    }

    // For appointment forms, additional validation
    if (formType === 'appointment' && (!purpose || !appointmentDate || !appointmentTime || !termsAccepted)) {
      return res.status(400).json({
        success: false,
        message: 'Purpose, appointment date, time, and terms acceptance are required for appointments'
      });
    }

    // Generate slug from fullName
    const slug = fullName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if lead with same email and formType already exists (to prevent duplicates)
    const existingLead = await Agent.findOne({ 
      email, 
      formType,
      isAgent: { $ne: true } // Only check non-agent leads
    });
    
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this email and form type already exists'
      });
    }

    const leadData = {
      slug,
      fullName,
      email,
      phone: phone || mobileNumber || '',
      city: city || '',
      formType: formType || 'contact-us',
      message: message || '',
      isAgent: false, // Flag to identify this is a form submission, not an agent
      createdAt: new Date(),
      // Additional fields for different form types
      purpose: purpose || '',
      appointmentDate: appointmentDate || '',
      appointmentTime: appointmentTime || '',
      termsAccepted: termsAccepted || false,
      notes: notes || '',
      yourName: yourName || fullName,
      // Default values for compatibility
      lastName: fullName?.split(' ').slice(1).join(' ') || '',
      marketCenter: 'Form Submission',
      addressTo: city || '',
      surname: fullName?.split(' ').slice(1).join(' ') || '',
      companyName: 'Form Submission',
      dob: new Date(),
      educationStatus: 'Not Specified',
      province: city || '',
      hearAboutUs: 'Website Form',
      promotionalConsent: false,
      personalDataConsent: false,
      imageUrl: ''
    };

    const newLead = new Agent(leadData);
    const savedLead = await newLead.save();

    console.log('Lead created successfully:', savedLead._id);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: savedLead
    });

  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: err.message
    });
  }
};

// Create a new agent/lead
export const createAgent = async (req, res) => {
  try {
    console.log('Creating new agent/lead:', req.body);
    
    const {
      fullName,
      lastName,
      email,
      phone,
      city,
      marketCenter,
      formType
    } = req.body;

    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      });
    }

    // Generate slug from fullName
    const slug = fullName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if agent with same email already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this email already exists'
      });
    }

    const agentData = {
      slug,
      fullName,
      lastName: lastName || '',
      email,
      phone: phone || '',
      city: city || '',
      marketCenter: marketCenter || 'KW Saudi Arabia',
      active: true
    };

    const newAgent = new Agent(agentData);
    const savedAgent = await newAgent.save();

    console.log('Agent created successfully:', savedAgent._id);

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: savedAgent
    });

  } catch (err) {
    console.error('Error creating agent:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create agent',
      error: err.message
    });
  }
};

// Update an existing agent/lead
export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating agent:', id, req.body);

    const {
      fullName,
      lastName,
      email,
      phone,
      city,
      marketCenter,
      active
    } = req.body;

    // Check if agent exists
    const existingAgent = await Agent.findById(id);
    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check if email is being changed and if it conflicts with another agent
    if (email && email !== existingAgent.email) {
      const emailConflict = await Agent.findOne({ email, _id: { $ne: id } });
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists with another agent'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (marketCenter !== undefined) updateData.marketCenter = marketCenter;
    if (active !== undefined) updateData.active = active;

    // Update slug if fullName changed
    if (fullName) {
      updateData.slug = fullName.toLowerCase().replace(/\s+/g, '-');
    }

    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Agent updated successfully:', id);

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: updatedAgent
    });

  } catch (err) {
    console.error('Error updating agent:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update agent',
      error: err.message
    });
  }
};

// Delete an agent/lead
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting agent:', id);

    // Check if agent exists
    const existingAgent = await Agent.findById(id);
    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Delete the agent
    await Agent.findByIdAndDelete(id);

    console.log('Agent deleted successfully:', id);

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });

  } catch (err) {
    console.error('Error deleting agent:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agent',
      error: err.message
    });
  }
};



