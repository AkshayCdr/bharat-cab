import { rideServices } from "../services/ride.services";
import { test, assert } from "vitest";

test("update status using given ID", async () => {
  const id = "140e2103-e4f9-4a1f-8611-1a9462bf046a";
  const status = "requested";
  await rideServices.updateStatus(id, status);
});
