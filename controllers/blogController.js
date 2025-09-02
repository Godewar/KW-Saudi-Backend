import Blog from '../models/Blog.js';

// Create blog
export const createBlog = async (req, res) => {
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

    // Generate slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const blog = new Blog({
      title,
      slug,
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

    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog', details: error.message });
  }
};

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get blog' });
  }
};

// Get blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get blog' });
  }
};

// Update blog by ID
export const updateBlog = async (req, res) => {
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

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog', details: error.message });
  }
};

// Update blog by slug
export const updateBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog', details: error.message });
  }
};

// Delete blog by ID
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

// Delete blog by slug
export const deleteBlogBySlug = async (req, res) => {
  try {
    const deleted = await Blog.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ message: 'Blog deleted successfully' });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
