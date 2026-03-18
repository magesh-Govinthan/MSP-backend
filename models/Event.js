import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    Totalticket: {
      type: Number,
      required: true,
    },

    // ✅ Ticket Types
    ticketTypes: [
      {
        ticketName: {
          type: String, // Example: General, VIP
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        availableTickets: {
          type: Number,
          required: true,
        },
      },
    ],

    eventImage: {
      type: String,
    },

    eventInformation: {
      type: String,
      required: true,
    },

    starGuest: {
      type: String,
    },

    whatNew: {
      type: String,
    },

    newFeatures: [
      {
        type: String,
      },
    ],

    specialFor: {
      type: String,
    },

    specialFeatures: [
      {
        type: String,
      },
    ],

    facility: {
      type: String,
    },

    facilitiesList: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
