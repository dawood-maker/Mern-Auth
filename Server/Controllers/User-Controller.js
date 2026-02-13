import User from "../models/User.js";

export const getUserDate = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        userDate: {
          name: user.name,
          isAccountVerify: user.isAccountVerify,
        },
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
