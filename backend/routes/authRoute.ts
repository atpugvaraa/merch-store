// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import express from "express";
import {login, logout, user} from "../controllers/authController";

const router = express.Router();

router.post("/", login)
router.get("/", logout)
router.get("/", user)

export default router;