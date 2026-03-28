import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
dotenv.config()
const app=express();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use (express.json());
app.use(cors({
    origin: "http://localhost:5173", // React app URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


//mongoDb connect
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Connected MongoDb"))
.catch((err)=>console.log(err));

app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);



const PORT = process.env.PORT||4000;

app.listen(PORT,()=>{
console.log(`Server is running ${PORT}`);
})