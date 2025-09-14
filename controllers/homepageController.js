import HomePage from "../models/homepage.js";


// CREATE Home Page
export const createHomePage = async (req, res) => {
  try {
    const { pageName, heading, subheading, status } = req.body;

    // handle uploaded images
    const images = req.files?.backgroundImage
      ? req.files.backgroundImage.map(file => file.path)
      : [];

    const newPage = new HomePage({
      pageName,
      backgroundImage: images,
      heading,
      subheading,
      status,
    });

    await newPage.save();
    res.status(201).json(newPage);
  } catch (error) {
    res.status(500).json({ message: "Error creating Home Page", error });
  }
};

// GET all Home Pages
export const getAllHomePages = async (req, res) => {
  try {
    const pages = await HomePage.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Home Pages", error });
  }
};

// GET Home Page by ID
export const getHomePageById = async (req, res) => {
  try {
    const page = await HomePage.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Home Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Home Page", error });
  }
};

// UPDATE Home Page by ID
export const updateHomePageById = async (req, res) => {
  try {
    const { pageName, heading, subheading, status } = req.body;

    let updateData = { pageName, heading, subheading, status };

    // if new images uploaded, replace/add them
    if (req.files?.backgroundImage) {
      updateData.backgroundImage = req.files.backgroundImage.map(file => file.path);
    }

    const updatedPage = await HomePage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedPage) return res.status(404).json({ message: "Home Page not found" });

    res.json(updatedPage);
  } catch (error) {
    res.status(500).json({ message: "Error updating Home Page", error });
  }
};

// DELETE Home Page by ID
export const deleteHomePageById = async (req, res) => {
  try {
    const deletedPage = await HomePage.findByIdAndDelete(req.params.id);
    if (!deletedPage) return res.status(404).json({ message: "Home Page not found" });

    res.json({ message: "Home Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Home Page", error });
  }
};
