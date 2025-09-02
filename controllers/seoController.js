import SEO from '../models/SEO.js';

// Create SEO
export const createSEO = async (req, res) => {
  const { pageName, metaDescription, metaKeyword } = req.body;

  try {
    const seo = new SEO({
      pageName,
      pageSlug: pageName.toLowerCase().replace(/\s+/g, '-'),
      metaDescription,
      metaKeywords: metaKeyword
    });
    const saved = await seo.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'SEO creation failed', details: error.message });
  }
};

// Get all SEO entries
export const getAllSEO = async (req, res) => {
  try {
    const seoEntries = await SEO.find({}).sort({ createdAt: -1 });
    res.status(200).json(seoEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SEO entries' });
  }
};

// Get SEO by ID
export const getSEOById = async (req, res) => {
  try {
    const seo = await SEO.findById(req.params.id);
    if (!seo) return res.status(404).json({ error: 'SEO not found' });
    res.status(200).json(seo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve SEO data' });
  }
};

// Get SEO by Slug
export const getSEOBySlug = async (req, res) => {
  try {
    const seo = await SEO.findOne({ pageSlug: req.params.slug });
    if (!seo) return res.status(404).json({ error: 'SEO not found' });
    res.status(200).json(seo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve SEO data' });
  }
};

// Update SEO by ID
export const updateSEO = async (req, res) => {
  const { pageName, metaDescription, metaKeyword } = req.body;

  try {
    const updateFields = {};
    if (pageName) updateFields.pageName = pageName;
    if (metaDescription) updateFields.metaDescription = metaDescription;
    if (metaKeyword) updateFields.metaKeywords = metaKeyword;
    
    const seo = await SEO.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!seo) return res.status(404).json({ error: 'SEO not found' });
    res.status(200).json(seo);
  } catch (error) {
    res.status(500).json({ error: 'SEO update failed', details: error.message });
  }
};

// Create or Update SEO by Slug
export const createOrUpdateSEO = async (req, res) => {
  const { pageName, metaDescription, metaKeyword } = req.body;

  try {
    const seo = await SEO.findOneAndUpdate(
      { pageSlug: req.params.slug },
      { 
        pageName, 
        metaDescription, 
        metaKeywords: metaKeyword 
      },
      { upsert: true, new: true }
    );
    res.status(200).json(seo);
  } catch (error) {
    res.status(500).json({ error: 'SEO update failed', details: error.message });
  }
};

// Delete SEO by ID
export const deleteSEO = async (req, res) => {
  try {
    const deletedSEO = await SEO.findByIdAndDelete(req.params.id);
    if (!deletedSEO) return res.status(404).json({ error: 'SEO not found' });
    res.status(200).json({ message: 'SEO deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'SEO deletion failed' });
  }
};

// Delete SEO by Slug
export const deleteSEOBySlug = async (req, res) => {
  try {
    const deletedSEO = await SEO.findOneAndDelete({ pageSlug: req.params.slug });
    if (!deletedSEO) return res.status(404).json({ error: 'SEO not found' });
    res.status(200).json({ message: 'SEO deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'SEO deletion failed' });
  }
};
