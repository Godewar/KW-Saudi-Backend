import Page from '../models/Page.js';

// CREATE
export const createPage = async (req, res) => {
  try {
    const { pageName, backgroundOverlayContent } = req.body;
    if (!pageName) {
      return res.status(400).json({ error: 'Page name is required' });
    }
    const backgroundImage = req.files?.backgroundImage?.[0]?.path || req.body.backgroundImage;
    const page = new Page({
      pageName,
      slug: pageName.toLowerCase().replace(/\s+/g, '-'),
      backgroundImage,
      backgroundOverlayContent
    });
    const saved = await page.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create page', details: error.message });
  }
};



// GET ALL PAGES
export const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find({}).sort({ createdAt: -1 });
    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pages' });
  }
};

// READ BY ID
export const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get page' });
  }
};

// READ BY SLUG
export const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get page' });
  }
};

// UPDATE BY ID
export const updatePageById = async (req, res) => {
  try {
    const { pageName, backgroundOverlayContent } = req.body;
    const backgroundImage = req.files?.backgroundImage?.[0]?.path || req.body.backgroundImage;
    const updateFields = {};
    if (pageName) updateFields.pageName = pageName;
    if (backgroundImage) updateFields.backgroundImage = backgroundImage;
    if (backgroundOverlayContent !== undefined) updateFields.backgroundOverlayContent = backgroundOverlayContent;
    
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page', details: error.message });
  }
};




// UPDATE BY SLUG
export const updatePageBySlug = async (req, res) => {
  try {
    const { pageName, backgroundOverlayContent } = req.body;
    const backgroundImage = req.files?.backgroundImage?.[0]?.path || req.body.backgroundImage;
    const updateFields = {};
    if (pageName) updateFields.pageName = pageName;
    if (backgroundImage) updateFields.backgroundImage = backgroundImage;
    if (backgroundOverlayContent !== undefined) updateFields.backgroundOverlayContent = backgroundOverlayContent;
    
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      updateFields,
      { new: true, runValidators: true }
    );
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page', details: error.message });
  }
};




// DELETE BY ID
export const deletePageById = async (req, res) => {
  try {
    const deletedPage = await Page.findByIdAndDelete(req.params.id);
    if (!deletedPage) return res.status(404).json({ error: 'Page not found' });
    res.status(200).json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Page deletion failed' });
  }
};

// DELETE BY SLUG
export const deletePageBySlug = async (req, res) => {
  try {
    const deletedPage = await Page.findOneAndDelete({ slug: req.params.slug });
    if (!deletedPage) return res.status(404).json({ error: 'Page not found' });
    res.status(200).json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Page deletion failed' });
  }
};
