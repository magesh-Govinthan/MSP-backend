import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    sessionId: { type: String, required: true },
    paymentIntentId: { type: String, required: true },
    quantity: { type: Object, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);