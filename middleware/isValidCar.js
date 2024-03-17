// validateCarDetails middleware
const isValidCar = (req, res, next) => {
    const { engine_capacity, engine_type } = req.body;
  
    // Check if engine_capacity is between 0.8 and 8
    if (engine_capacity < 0.8 || engine_capacity > 8) {
      return res.status(400).json({ error: 'Invalid engine capacity' });
    }
  
    // Check if engine_type is one of the allowed types
    const allowedEngineTypes = ['Diesel', 'Petrol', 'Hybrid'];
    if (!allowedEngineTypes.includes(engine_type)) {
      return res.status(400).json({ error: 'Invalid engine type' });
    }
  
    // If car details are valid, proceed to the next middleware
    next();
  };
  
  module.exports = isValidCar;
  