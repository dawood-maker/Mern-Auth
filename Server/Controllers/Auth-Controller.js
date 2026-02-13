import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transport from "../Config/nodemailer.js";

// ================= USER REGISTER =================
export const register = async (req, res) => {
  console.log("📥 Register API called");
  const { name, email, password } = req.body;
  console.log("📩 Received Data:", { name, email });

  if (!name || !email || !password) {
    console.log("❌ Missing Fields");
    return res.json({ success: false, message: "Please fill all the fields" });
  }

  try {
    const existingUser = await User.findOne({ email });
    console.log("🔍 Checking existing user...");

    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password Hashed");

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log("✅ User Saved in Database:", user._id);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to GreatStack",
      text: `Welcome to GreatStack website. Your account has been created with email: ${email}`,
    };

    try {
      await transport.sendMail(mailOptions);
      console.log("✅ Welcome Email Sent to:", email);
    } catch (emailError) {
      console.error("❌ Welcome Email Failed:", emailError.message);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("🎟 JWT Token Generated");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Cookie Set Successfully");

    return res.json({
      success: true,
      message: "User registered successfully ✅",
    });
  } catch (error) {
    console.error("REGISTER ERROR ❌", error);
    return res.json({ success: false, message: error.message });
  }
};

// ================= USER LOGIN =================
export const login = async (req, res) => {
  console.log("📥 Login API called");

  const { email, password } = req.body;
  console.log("📩 Login Data:", { email });

  if (!email || !password) {
    console.log("❌ Missing Email or Password");
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    console.log("🔍 Searching user...");

    if (!user) {
      console.log("❌ Invalid Email:", email);
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password Match Status:", isMatch);

    if (!isMatch) {
      console.log("❌ Invalid Password");
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("🎟 JWT Token Generated");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Login Cookie Set");

    return res.json({ success: true, message: "Login Successful ✅" });
  } catch (error) {
    console.error("LOGIN ERROR ❌", error);
    return res.json({ success: false, message: error.message });
  }
};

// ================= USER LOGOUT =================
export const logout = async (req, res) => {
  console.log("📤 Logout API called");

  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    console.log("🍪 Cookie Cleared");

    return res.json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR ❌", error);
    return res.json({ success: false, message: error.message });
  }
};

// ================= SEND VERIFY OTP =================
export const sendverifyOtp = async (req, res) => {
  console.log("📨 Send Verify OTP API called");

  try {
    const { userId } = req.body;
    console.log("👤 User ID:", userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ User Not Found");
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerify) {
      console.log("⚠️ Account Already Verified");
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log("🔢 Generated OTP:", otp);

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();
    console.log("💾 OTP Saved in Database");

    const mailOption = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. It expires in 24 hours.`,
    };

    await transport.sendMail(mailOption);
    console.log("✅ OTP Email Sent to:", user.email);

    return res.json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  } catch (error) {
    console.error("OTP SEND ERROR ❌", error);
    return res.json({ success: false, message: error.message });
  }
};

// ================= VERIFY EMAIL =================
export const VerifyEmail = async (req, res) => {
  console.log("📩 Verify Email API called");

  const { userId, otp } = req.body;
  console.log("📥 Received:", { userId, otp });

  if (!userId || !otp) {
    console.log("❌ Missing Details");
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ User Not Found");
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      console.log("❌ Invalid OTP");
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      console.log("⏳ OTP Expired");
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerify = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    console.log("✅ Email Verified Successfully");

    return res.json({
      success: true,
      message: "Email Verified Successfully ✅",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR ❌", error);
    return res.json({ success: false, message: error.message });
  }
};

// ================= IS ACCOUNT VERIFY =================
export const isAccountVerify = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//================= SEND RESET PASSWORD OTP =================

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log("🔢 Generated OTP:", otp);

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();
    console.log("💾 OTP Saved in Database");

    const mailOption = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting password is ${otp}. 
      Use this OTP to proceed with resetting your password .`,
    };

    await transport.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Reset OTP sent on Email",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//================= RESET USERPASSWORD =================

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP and New Password are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset Successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
