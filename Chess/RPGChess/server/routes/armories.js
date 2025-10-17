import express from "express";
import path from "path";
import ArmoriesController from "../controllers/armories.js";

const router = express.Router();
console.log("armories route running");
router.get("/", ArmoriesController.getArmories);

router.get('/:armoryId', ArmoriesController.getArmoryById);

export default router;
