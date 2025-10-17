import express from "express";
import path from "path";
import GiftsController from "../controllers/gifts.js";



// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const router = express.Router();
console.log("route running");
router.get("/", GiftsController.getGifts);
// router.get("/", (req, res) => {
//   res.status(200).json(giftData);
// });

router.get('/:giftId', GiftsController.getGiftById);
//router.get("/:giftId", (req, res) => {
  //router.get('/:giftId', GiftsController.getGiftByI)
  
  //creating get route
  //res.status(200).sendFile(path.resolve(__dirname, "../public/gift.html"));
//});

router.post('/', GiftsController.createGift);

router.delete('/', GiftsController.deleteGift);

router.patch('/:id', GiftsController.updateGift);

export default router;
