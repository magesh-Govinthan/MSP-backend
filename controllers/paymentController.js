import Stripe from "stripe";
import dotenv from "dotenv";
import Event from "../models/Event.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {

  try {
    const { eventId, ticketType, quantity } = req.body;
    console.log(req);

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Find ticket type
    const ticket = event.ticketTypes.find((t) => t.ticketName === ticketType);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket type not found",
      });
    }

    // Check ticket availability
    if (ticket.availableTickets < quantity) {
      return res.status(400).json({
        message: "Not enough tickets available",
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name: `${event.eventName} - ${ticket.ticketName}`,
            },

            unit_amount: ticket.price * 100,
          },

          quantity: quantity,
        },
      ],

      mode: "payment",

      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment session creation failed",
      error: error.message,
    });
  }
};