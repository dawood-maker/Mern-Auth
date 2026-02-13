import express from "express";
import {
  isAccountVerify,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendverifyOtp,
  VerifyEmail,
} from "../Controllers/Auth-Controller.js";

import UserAuth from "../middleware/User-Auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", UserAuth, sendverifyOtp);
router.post("/verify-account", UserAuth, VerifyEmail);
router.post("/is-auth", UserAuth, isAccountVerify); // ✅ fixed
router.post("/send-reset-password-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
