import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { sendEmail } from "../Utils/sendEmail.js";

// BOOK TICKET (Customer)
export const bookTicket = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    console.log(req);
    // Find event
    const event = await Event.findById(eventId);
    console.log("Event ID:", event);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find ticket type
    const ticket = event.ticketTypes.find((t) => t.ticketName === ticketType);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket type not found" });
    }

    // Check availability
    if (ticket.availableTickets < quantity) {
      return res.status(400).json({
        message: "Not enough tickets available",
      });
    }

    // Reduce tickets
    ticket.availableTickets -= quantity;

    // Save event update
    await event.save();

    // Calculate total price
    const totalPrice = ticket.price * quantity;

    // Create booking
    const booking = new Ticket({
      event: eventId,
      user: req.body.user,
      ticketType,
      quantity,
      pricePerTicket: ticket.price,
      totalPrice,
    });

    await booking.save();

   
    const htmlContent = `
      <h2>Bravo! Your ticket is confirmed 🎉</h2>
      <p>Event: ${event.eventName}</p>
      <p>Ticket Type: ${ticketType}</p>
      <p>Quantity: ${quantity}</p>
      <p>Total Price: $${totalPrice}</p>
      <p>Thank you for booking!</p>
    `;
    await sendEmail(req.body.email, "Ticket Booking Confirmation", htmlContent);

    res.status(201).json({
      message: "Ticket booked successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
};

// GET MY TICKETS (Customer)
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      user: req.body.user,
    }).populate("event", "eventName date venue");

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL TICKET
export const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = "cancelled";

    await ticket.save();

    res.json({ message: "Ticket cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
