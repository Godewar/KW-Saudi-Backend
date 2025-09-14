import News from '../models/News.js';

// Create news
export const createNews = async (req, res) => {
  try {
    console.log('Creating news with body:', req.body);
    console.log('Files:', req.files);
    
    const {
      title,
      content,
      author,
      tags,
      isPublished,
      publishedAt,
      location,
      eventDate
    } = req.body;

    const contentImage = req.files?.contentImage?.[0]?.path;
    const coverImage = req.files?.coverImage?.[0]?.path;
    
    // Handle multiple additional images
    const additionalImages = req.files?.additionalImages ? 
      req.files.additionalImages.map(file => file.path) : [];

    const news = new News({
      title,
      content,
      author,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      isPublished: isPublished === 'true' || isPublished === true,
      publishedAt: isPublished === 'true' || isPublished === true ? new Date() : null,
      contentImage,
      coverImage,
      location,
      eventDate: eventDate ? new Date(eventDate) : null,
      additionalImages
    });

    const saved = await news.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news', details: error.message });
  }
};

// Get all news
export const getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

// Get news by ID
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get news' });
  }
};

// Update news by ID
export const updateNews = async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      tags,
      isPublished,
      publishedAt,
      location,
      eventDate
    } = req.body;

    const contentImage = req.files?.contentImage?.[0]?.path;
    const coverImage = req.files?.coverImage?.[0]?.path;
    
    // Handle multiple additional images
    const additionalImages = req.files?.additionalImages ? 
      req.files.additionalImages.map(file => file.path) : [];

    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (author !== undefined) updateFields.author = author;
    if (tags) updateFields.tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
    if (isPublished !== undefined) updateFields.isPublished = isPublished === 'true' || isPublished === true;
    if (contentImage) updateFields.contentImage = contentImage;
    if (coverImage) updateFields.coverImage = coverImage;
    if (location !== undefined) updateFields.location = location;
    if (eventDate !== undefined) updateFields.eventDate = eventDate ? new Date(eventDate) : null;
    if (additionalImages.length > 0) updateFields.additionalImages = additionalImages;
    
    // Update publishedAt if status is changing to published
    if (isPublished === 'true' || isPublished === true) {
      updateFields.publishedAt = new Date();
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news', details: error.message });
  }
};

// Delete news by ID
export const deleteNews = async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'News not found' });
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
};

// Get news by category
export const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const news = await News.find({ category, isPublished: true })
      .sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news by category' });
  }
};
