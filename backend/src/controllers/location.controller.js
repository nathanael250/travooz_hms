const { Location } = require('../models');

// Get all locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      order: [['location_name', 'ASC']]
    });

    res.json({
      success: true,
      locations: locations || []
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
};

// Get location by ID
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
};

module.exports = {
  getAllLocations,
  getLocationById
};