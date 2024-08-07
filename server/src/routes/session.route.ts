import { Router } from "express";
import {
    deleteSession,
    getAccountType,
    insertIntoSession,
} from "../controllers/session.controller";
import { validateSession } from "../utils/account.auth";

const route = Router();

route.get("/account-type", validateSession, getAccountType);

route.post("/", insertIntoSession);

route.delete("/:id", validateSession, deleteSession);

export default route;
