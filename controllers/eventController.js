import Event from "../models/Event.js";

// ORGANIZER CREATE EVENT
export const createEvent = async (req, res) => {

  console.log(req);
  
  try {
    let status;
    if (req.user.role === "admin") {
      status = "approved";
    }

    const event = await Event.create({
      ...req.body,
      status,
      organization: req.user.id,
    });

    res.status(201).json({
      message: "Event created",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "error",message:error.message });
  }
};

// GET ALL EVENTS (Customer)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email",
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ORGANIZER/ADMIN UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const {
      eventName,
      category,
      date,
      time,
      location,
      venue,
     ticketTypes,
      eventImage,
      eventInformation,
      starGuest,
      whatNew,
      newFeatures,
      specialFor,
      specialFeatures,
      facility,
      facilitiesList,
      status,
    } = req.body;

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
   const updated = await Event.findByIdAndUpdate(
     req.params.id,
     {
       eventName,
       category,
       date,
       time,
       location,
       venue,
       ticketTypes,
       eventImage,
       eventInformation,
       starGuest,
       whatNew,
       newFeatures,
       specialFor,
       specialFeatures,
       facility,
       facilitiesList,
       status,
     },
     {
       new: true,
     },
   );
  
    res.status(200).json({message:"updated",data:updated});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ORGANIZER DELETE EVENT
export const deleteEvent = async (req, res) => {
  
  try {

    const event = await Event.findById(req.params.id);
     
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN APPROVE EVENT
export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    );

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN REJECT EVENT
export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
