import Event from "../models/Event.js";
import User from "../models/User.js";
import { sendEmail } from "../Utils/sendEmail.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
// ORGANIZER CREATE EVENT
export const createEvent = async (req, res) => {

 
  
  try {
    let status;
    if (req.user.role === "admin") {
      status = "approved";
    }

    const event = await Event.create({
      ...req.body,
      status,
      organizer: req.user.id,
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
    const events = await Event.find().populate("organizer", "name email");

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE EVENT
export const getEventById = async (req, res) => {

  try {
    const events = await Event.find({
      organizer: req.params.id,
    }).populate("organizer", "name email");
 
    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No events found for this user" });
    }

    res.json(events);
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
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete all tickets for this event
    await Ticket.deleteMany({ event: eventId });

    // Delete all payments for this event
    await Payment.deleteMany({ event: eventId });

    // Finally, delete the event
    await Event.findByIdAndDelete(eventId);

    res.json({ message: "Event and all associated tickets & payments deleted" });
  } catch (error) {
    console.error(error);
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


export const ReminderNotificationForUser = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: "ticketId is required" });
    }

    // 1️⃣ Fetch the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 2️⃣ Fetch the event
    const event = await Event.findById(ticket.event._id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 3️⃣ Fetch the user
    const user = await User.findById(ticket.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 4️⃣ Prepare the reminder email content
    const htmlContent = `
      <h2>⏰ Reminder: Upcoming Event!</h2>
      <p>Hello ${user.name},</p>
      <p>This is a friendly reminder for the event <strong>${event.eventName}</strong> you booked.</p>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Quantity:</strong> ${ticket.quantity}</p>
      <p><strong>Total Price:</strong> $${ticket.totalPrice}</p>
      <p>We look forward to seeing you at the event!</p>
    `;

    // 5️⃣ Send the reminder email
    await sendEmail(user.email, "Event Reminder Notification", htmlContent);

    res.status(200).json({
      message: `Reminder notification sent to ${user.name} (${user.email})`,
      ticket,
    });
  } catch (error) {
    console.error("Error sending reminder notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};