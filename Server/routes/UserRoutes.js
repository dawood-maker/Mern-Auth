import express from "express"
import UserAuth from "../middleware/User-Auth.js";
import { getUserDate } from "../Controllers/User-Controller.js";

const UserRouter = express.Router();

UserRouter.get("/data", UserAuth, getUserDate);

export default UserRouter;