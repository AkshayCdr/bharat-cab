import { Request, Response } from "express";
import { Session } from "../dtos/session.dto";
import { user } from "../services/user.services";
import { verifyPassword } from "../utils/passwordUtils";

export async function insertIntoSession(
  req: Request<{}, {}, Session>,
  res: Response
) {
  try {
    const { username, password } = req.body;

    const isUserExist = await user.checkUsername(username);

    if (!isUserExist)
      return res.status(401).send({ message: "invalid username" });

    const passwordHash = await user.getPassword(username);

    if (!passwordHash) res.status(500).send({ message: "password not exist" });

    const match = await verifyPassword(password, passwordHash);

    if (!match) return res.status(401).send({ message: "invalid password" });

    res.status(200).send({ message: "login success" });
  } catch (error) {
    res.status(500).send({ message: error });
  }
}
