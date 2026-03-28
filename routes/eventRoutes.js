import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRolesMiddleware } from "../middleware/adminMiddleware.js";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  ReminderNotificationForUser,
} from "../controllers/eventController.js";

const router = express.Router();

// CUSTOMER
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// ORGANIZATION
router.post("/create", authMiddleware,  allowRolesMiddleware("admin", "organizer"), createEvent);

router.put("/update/:id", authMiddleware, allowRolesMiddleware("admin", "organizer") , updateEvent);
router.delete(
  "/delete/:id",
  authMiddleware,
  allowRolesMiddleware("admin", "organizer") ,
  deleteEvent,
);

// ADMIN
router.put(
  "/approve/:id",
  authMiddleware,
  allowRolesMiddleware("admin"),
  approveEvent,
);

router.post("/notify-event", 
  authMiddleware, 
  allowRolesMiddleware("admin", "organizer"),
   ReminderNotificationForUser);

router.put("/reject/:id", authMiddleware, allowRolesMiddleware("admin"), rejectEvent);

export default router;
