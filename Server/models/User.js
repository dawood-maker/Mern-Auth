import { verify } from "jsonwebtoken";
import mongoose, { Types } from "mongoose";

const useSchema = new mongoose.Schema({
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        verifyOtp: {type: String, default:''},
        verifyOtpExpireAt: {type: Number, default: 0},
        isAccountVerify: {type: Boolean, default: false},
        resetOtp: {type: String, default: ''},
        resetOtpExpireAt: {type: Number, default: 0},
})
       
const User = mongoose.models.User || mongoose.model('User', useSchema);
export default User