import express from "express";

import {
  bookTicket,
  getMyTickets,
  cancelTicket,
  transferTicket,
  getTicketsByEventId,
  getAllTickets,
  deleteTicket
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
  "/mytickets/:user",
  // authMiddleware,
  // roleMiddleware("customer"),
  getMyTickets,
);
router.get(
  "/allTickets",
  authMiddleware,
  allowRolesMiddleware("admin"),
  getAllTickets
);
// CANCEL TICKET
router.put(
  "/cancel/:id",
  // authMiddleware,
  // roleMiddleware("customer"),
  cancelTicket,
);
// get all tickets for organizer and admin
router.post(
  "/eventIds",
  authMiddleware,
  allowRolesMiddleware("admin", "organizer"),
  getTicketsByEventId
);
router.put(
  "/transfer",
  // authMiddleware,
  // roleMiddleware("customer"),
  transferTicket,
);

router.delete(
  "/:id",
  // authMiddleware,
  // roleMiddleware("customer"),
  deleteTicket,
);
export default router;
