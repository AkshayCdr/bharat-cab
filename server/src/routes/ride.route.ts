import { Router } from "express";
import {
  getRide,
  insertIntoRide,
  updateRide,
  requestForRide,
  addReview,
  getRideAndDriver,
  cancelRide,
  getRideAndUser,
} from "../controllers/ride.controller";

const route = Router();

route.post("/", insertIntoRide);

route.get("/:id", getRide);

route.put("/:id", updateRide);

route.get("/:id/driver", getRideAndDriver);

route.get("/:id/user", getRideAndUser);

route.patch("/:id", requestForRide);

route.patch("/:id/cancel", cancelRide);

route.patch("/:id/review", addReview);

export default route;
