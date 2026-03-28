import Stripe from "stripe";
import dotenv from "dotenv";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js"; // ✅ ADD THIS
import Payment from "../models/Payment.js";
import User from "../models/User.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ CREATE CHECKOUT SESSION (no logic change, only metadata added)
export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, ticketType, user } = req.body;

    if (!ticketType || typeof ticketType !== "object") {
      return res.status(400).json({ message: "Invalid ticketType" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const line_items = [];

    for (const [typeName, quantity] of Object.entries(ticketType)) {
      const qty = Number(quantity) || 0;
      if (qty <= 0) continue;

      const ticket = event.ticketTypes.find(
        (t) => t.ticketName.toLowerCase() === typeName.toLowerCase()
      );

      if (!ticket) continue;

      if (ticket.availableTickets < qty) {
        return res.status(400).json({
          message: `Not enough ${typeName} tickets available`,
        });
      }

      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${event.eventName} - ${ticket.ticketName}`,
          },
          unit_amount: ticket.price * 100,
        },
        quantity: qty,
      });
    }

    if (line_items.length === 0) {
      return res.status(400).json({ message: "No valid tickets selected" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",

      // ✅ ONLY ADDITION (no logic change)
      metadata: {
        userId: user,
        eventId: eventId,
        ticketType: JSON.stringify(ticketType),
      },
    });

    res.status(200).json({ url: session.url, session: session.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Payment session creation failed",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // 🔥 Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const { userId, eventId, ticketType  } = session.metadata;
    const parsedTickets = JSON.parse(ticketType);
      for (const [typeName, quantity] of Object.entries(parsedTickets)) {
        const qty = Number(quantity) || 0;
        if (qty <= 0) continue;

        const bookings = await Ticket.find({
          user: userId,
          event: eventId,
          ticketType: typeName, // 👈 important
        }).sort({ createdAt: -1 });

        // ✅ Update all matching bookings
        for (const booking of bookings) {
          if (booking.paymentStatus !== "paid") {
            booking.paymentStatus = "paid";
            await booking.save();
          }
        }
      }

      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: "Payment not completed" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const storePaymentInfo = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ message: "Session ID is required" });

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    const { userId, eventId, ticketType } = session.metadata;

    // Update ticket booking
    const booking = await Ticket.findOne({ user: userId, event: eventId }).sort({ createdAt: -1 });
    if (booking) {
      booking.paymentStatus = session.payment_status === "paid" ? "paid" : "pending";
      await booking.save();
    }
    

    // Store payment info
    const paymentData = new Payment({
      user: userId,
      event: eventId,
      sessionId: session.id,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount_received / 100, // convert to dollars
      quantity: JSON.parse(ticketType), // store quantity if booking exists
      currency: paymentIntent.currency,
      status: session.payment_status,
    });

    await paymentData.save();

    res.json({ success: true, message: "Payment info stored successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to store payment info", error: err.message });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ user: userId })
    .sort({ createdAt: -1 }) // descending: newest first
    .populate("user", "name email")        // optional: populate user details
    .populate("event", "eventName date");;

    res.json({ success: true, payments });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: err.message });
  }
};

export const getAllUserPaymets = async (req, res) => {
  try {
    const payments = await Payment.find()
    .sort({ createdAt: -1 }) // descending: newest first
    .populate("user", "name email")        // optional: populate user details
    .populate("event", "eventName date");;

    res.json({ success: true, payments });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: err.message });
  }
}

export const deletePayment = async(req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}