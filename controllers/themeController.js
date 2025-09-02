import Theme from '../models/Theme';
import slugify from 'slugify';

// Create a new theme
export const createTheme = async (req, res) => {
  try {
    const { primaryColor } = req.body;
    const slug = slugify(primaryColor, { lower: true });
    const theme = new Theme({ ...req.body, slug });
    await theme.save();
    res.status(201).json(theme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all themes
export const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find();
    res.status(200).json(themes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get theme by slug
export const getThemeBySlug = async (req, res) => {
  try {
    const theme = await Theme.findOne({ slug: req.params.slug });
    if (!theme) return res.status(404).json({ message: 'Theme not found' });
    res.status(200).json(theme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update theme by slug
export const updateTheme = async (req, res) => {
  try {
    const updatedData = req.body;
    if (updatedData.primaryColor) {
      updatedData.slug = slugify(updatedData.primaryColor, { lower: true });
    }

    const theme = await Theme.findOneAndUpdate(
      { slug: req.params.slug },
      updatedData,
      { new: true }
    );

    if (!theme) return res.status(404).json({ message: 'Theme not found' });
    res.status(200).json(theme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete theme by slug
export const deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findOneAndDelete({ slug: req.params.slug });
    if (!theme) return res.status(404).json({ message: 'Theme not found' });
    res.status(200).json({ message: 'Theme deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
