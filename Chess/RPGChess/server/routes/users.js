import express from "express";
import UsersController from "../controllers/users.js";

const router = express.Router();

// User management
router.post("/create", UsersController.createUser);
router.get("/player-data", UsersController.getPlayerData);
router.put("/player-data", UsersController.updatePlayerData);

// Armory management
router.post("/armories", UsersController.saveArmory);
router.put("/armories/:armoryId", UsersController.updateArmory);
router.delete("/armories/:armoryId", UsersController.deleteArmory);
router.get("/:userId/armories", UsersController.getUserArmories);

export default router;

