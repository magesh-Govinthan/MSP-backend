import express from "express";
import {createCheckoutSession, verifyPayment, storePaymentInfo, deletePayment, getAllUserPaymets, getUserPayments} from "../controllers/paymentController.js"


const router = express.Router();
router.post("/checkout", createCheckoutSession);

router.post("/verify-payment", verifyPayment);

router.post("/store", storePaymentInfo);

// Get all payments for a user
router.get("/user/:userId", getUserPayments);

router.get('/getallpayments', getAllUserPaymets)

router.delete('/:id', deletePayment)
export default router;
