import express from "express";
// import {
//   authMiddleware,
// } from "../middleware/authMiddleware.js";

import {
  bookTicket,
  getMyTickets,
  cancelTicket,
} from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRolesMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// CUSTOMER BOOK TICKET
router.post("/book",
  //  authMiddleware, 
  // roleMiddleware("customer"), 
  bookTicket);

// GET USER TICKETS
router.get(
  "/mytickets",
  // authMiddleware,
  // roleMiddleware("customer"),
  getMyTickets,
);

// CANCEL TICKET
router.put(
  "/cancel/:id",
  // authMiddleware,
  // roleMiddleware("customer"),
  cancelTicket,
);

export default router;
