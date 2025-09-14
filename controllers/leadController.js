// controllers/leadController.js
import Lead from '../models/lead.js';
import Agent from '../models/Agent.js';
import ExcelJS from 'exceljs';
// Export leads as Excel (all or filtered by formType)
export const exportLeadsExcel = async (req, res) => {
  try {
    const { formType } = req.query;
    const filter = { isAgent: false };
    if (formType) filter.formType = formType;
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    // Define columns
    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Mobile', key: 'mobileNumber', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Form Type', key: 'formType', width: 15 },
      { header: 'Address', key: 'address', width: 25 },
      { header: 'Bedrooms', key: 'bedrooms', width: 10 },
      { header: 'Property Type', key: 'property_type', width: 15 },
      { header: 'Valuation Type', key: 'valuation_type', width: 15 },
      { header: 'DOB', key: 'dob', width: 15 },
      { header: 'Education', key: 'educationStatus', width: 15 },
      { header: 'Promo Consent', key: 'promotionalConsent', width: 10 },
      { header: 'Data Consent', key: 'personalDataConsent', width: 10 },
      { header: 'Enquiry Type', key: 'enquiryType', width: 15 },
      { header: 'Message', key: 'message', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Add rows
    leads.forEach(lead => {
      worksheet.addRow({
        fullName: lead.fullName || lead.fullname || '',
        email: lead.email || '',
        mobileNumber: lead.mobileNumber || lead.phone || '',
        city: lead.city || '',
        formType: lead.formType || '',
        address: lead.address || '',
        bedrooms: lead.bedrooms || '',
        property_type: lead.property_type || '',
        valuation_type: lead.valuation_type || '',
        dob: lead.dob ? new Date(lead.dob).toLocaleDateString() : '',
        educationStatus: lead.educationStatus || '',
        promotionalConsent: lead.promotionalConsent ? 'Yes' : 'No',
        personalDataConsent: lead.personalDataConsent ? 'Yes' : 'No',
        enquiryType: lead.enquiryType || '',
        message: lead.message || '',
        createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '',
      });
    });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="leads_${formType || 'all'}_${new Date().toISOString().slice(0,10)}.xlsx"`);
  await workbook.xlsx.write(res, { stream: true });
  res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Create new lead
export const createLead = async (req, res) => {
  try {
    const data = req.body;
    const timestamp = Date.now();

    // Generate slug
    const slug = `${(data.fullName || data.fullname || 'lead')}-${timestamp}`
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check duplicates (based on email + formType)
    const existing = await Lead.findOne({ email: data.email, formType: data.formType });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Lead already exists' });
    }

    // Only jasmin/jeddah should use agents DB to set marketCenter
    if (data.formType === 'jasmin' || data.formType === 'jeddah') {
      try {
        const marketRegex = new RegExp(data.formType, 'i');
        const agentMatch = await Agent.findOne({
          isAgent: true,
          $or: [
            { marketCenter: { $regex: marketRegex } },
            { city: { $regex: new RegExp(data.city || '', 'i') } }
          ]
        });
        if (agentMatch?.marketCenter) {
          data.marketCenter = agentMatch.marketCenter;
        }
      } catch {}
    } else {
      // Ensure other forms do not carry marketCenter from request by mistake
      delete data.marketCenter;
    }

    const lead = new Lead({ ...data, slug });
    await lead.save();

    res.status(201).json({ success: true, message: 'Lead created', data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get all leads
export const getAllLeads = async (req, res) => {
  try {
    const { range } = req.query; // today | week | month | year

    const filter = { isAgent: false };

    if (range) {
      const now = new Date();
      let startDate;
      if (range === 'today') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (range === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (range === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (range === 'year') {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }
      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, total: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get only Jasmin & Jeddah leads
export const getJasminJeddahLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ 
      formType: { $in: ["jasmin", "jeddah"] }, 
      isAgent: false 
    }).sort({ createdAt: -1 });

    res.json({ success: true, total: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get single lead by ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update lead
export const updateLead = async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, message: 'Lead updated', data: updatedLead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete lead
export const deleteLead = async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);

    if (!deletedLead) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, message: 'Lead deleted', data: deletedLead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
