import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { sendEmail } from "../Utils/sendEmail.js";

// BOOK TICKET (Customer)
export const bookTicket = async (req, res) => {
  try {
    const { eventId, ticketType, user, email } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let bookings = [];
    let totalQuantity = 0;
    let grandTotal = 0;

    for (const [typeName, qtyValue] of Object.entries(ticketType)) {
      const quantity = Number(qtyValue) || 0;
      if (quantity <= 0) continue;

      const ticket = event.ticketTypes.find(
        (t) => t.ticketName.toLowerCase() === typeName.toLowerCase()
      );

      if (!ticket) {
        return res.status(404).json({
          message: `Ticket type ${typeName} not found`,
        });
      }

      if (ticket.availableTickets < quantity) {
        return res.status(400).json({
          message: `Not enough ${typeName} tickets`,
        });
      }

      // Deduct tickets
      ticket.availableTickets -= quantity;

      const totalPrice = ticket.price * quantity;

      // accumulate totals
      totalQuantity += quantity;
      grandTotal += totalPrice;

      const booking = new Ticket({
        event: eventId,
        user: user, // must be user._id
        ticketType: ticket.ticketName,
        quantity,
        pricePerTicket: ticket.price,
        totalPrice,
      });

      await booking.save();
      bookings.push(booking);
    }

    await event.save();

    // ✅ Build Email Content CORRECTLY
    const ticketDetailsHTML = bookings
      .map(
        (t) => `
        <p>${t.ticketType}: ${t.quantity} × $${t.pricePerTicket} = $${t.totalPrice}</p>
      `
      )
      .join("");

    const htmlContent = `
      <h2>🎉 Your booking is confirmed!</h2>
      <p><strong>Event:</strong> ${event.eventName}</p>
      ${ticketDetailsHTML}
      <hr/>
      <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
      <p><strong>Total Price:</strong> $${grandTotal}</p>
      <p>Thank you for booking!</p>
    `;

    await sendEmail(email, "Ticket Booking Confirmation", htmlContent);

    res.status(201).json({
      message: "Tickets booked successfully",
      bookings,
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
  console.log(req);
  try {
    const tickets = await Ticket.find({
      user: req.params.user,
    }).populate("event", "eventName date venue");
    
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All tickets (Organizer/Admin)
export const getTicketsByEventId = async (req, res) => {
  try {

    const { eventIds } = req.body;
    const tickets = await Ticket.find({
      event: { $in: eventIds },
    })
      .populate("event", "eventName date venue")
      .populate("user", "name email");

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found for this event" });
    }

    res.status(200).json(tickets);
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

    // double cancel
    if (ticket.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Ticket already cancelled" });
    }

    // 1️⃣ Update ticket status
    ticket.bookingStatus = "cancelled";
    await ticket.save();

    // 2️⃣ Increase event available tickets
    const event = await Event.findById(ticket.event._id);
    console.log(event);
    if (event) {
      if (ticket.ticketType === "General") {
        event.ticketTypes[0].availableTickets += ticket.quantity;
      } else if (ticket.ticketType === "VIP") {
        event.ticketTypes[1].availableTickets += ticket.quantity;
      }
    }
    console.log('after updation',event)
    res.json({ message: "Ticket cancelled and quantity restored" });
    await event.save();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};
export const transferTicket = async (req, res) => {
  const { ticketId, recipientEmail } = req.body;

  try {
    // 1️⃣ Find the ticket
    const ticket = await Ticket.findById(ticketId);
    const event = await Event.findById(ticket.event._id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // 2️⃣ Only booked tickets can be transferred
    if (ticket.bookingStatus !== "booked" && ticket.bookingStatus !== "transferred") {
      return res.status(400).json({ message: "Only booked tickets can be transferred" });
    }

    // 3️⃣ Mark ticket as transferred
    ticket.bookingStatus = "transferred"; // or "pending transfer"
    ticket.transfer = {
      recipientEmail,
      transferredAt: new Date(),
      claimed: false, // recipient hasn’t claimed yet
    };

    await ticket.save();

    // 4️⃣ Optionally: send email to recipient here
    // sendEmail(recipientEmail, `You received a ticket for ${ticket.event.eventName}`)
    

    const htmlContent = `
      <h2>🎉 Your ticket is transferred to ${recipientEmail.split('@')[0]}!</h2>
      <p><strong>Event:</strong> ${event.eventName}</p>
      <hr/>
      <p><strong>Total Quantity:</strong> ${ticket.quantity}</p>
      <p><strong>Total Price:</strong> $${ticket.totalPrice}</p>
      <p>Thank you for using our transfer service!</p>
    `;

    await sendEmail(recipientEmail, "Ticket Transferred Confirmation", htmlContent);

    res.json({
      message: `Ticket successfully transferred to ${recipientEmail}`,
      ticket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("event", "eventName date venue")
      .populate("user", "name email");

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTicket = async(req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}