import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
  recipientEmail: { type: String, required: true },
  transferredAt: { type: Date, default: Date.now },
  claimed: { type: Boolean, default: false },
});

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ticketType: {
      type: String, 
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    pricePerTicket: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["booked", "cancelled", "transferred"],
      default: "booked",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    transfer: transferSchema,
  },
  { timestamps: true },
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
