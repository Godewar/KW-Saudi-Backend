import Services from '../models/Listing.js';

// Create a new service
export const createService = async (req, res) => {
  try {
    const service = new Services(req.body);
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service', details: error.message });
  }
};

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Services.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get a single service by slug
export const getServiceBySlug = async (req, res) => {
  try {
    const service = await Services.findOne({ slug: req.params.slug });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

// Update a service by slug
export const updateServiceBySlug = async (req, res) => {
  try {
    const service = await Services.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service', details: error.message });
  }
};

// Delete a service by slug
export const deleteServiceBySlug = async (req, res) => {
  try {
    const deleted = await Services.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
