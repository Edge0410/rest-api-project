// validateBookingDates middleware
const isValidDateFormat = (req, res, next) => {
    const { checkin_date, checkout_date } = req.body;
  
    // Check if checkin_date and checkout_date are valid dates
    const isValidDate = (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    };
  
    if (!isValidDate(checkin_date) || !isValidDate(checkout_date)) {
      return res.status(400).json({ error: "Invalid date format" });
    }
  
    // Check if checkin_date is smaller than checkout_date
    if (new Date(checkin_date) >= new Date(checkout_date)) {
      return res
        .status(400)
        .json({ error: "Check-in date must be before check-out date" });
    }
  
    // If booking dates are valid, proceed to the next middleware
    next();
  };
  
  module.exports = isValidDateFormat;
  