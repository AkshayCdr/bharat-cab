import { Request, Response } from "express";
import { account } from "../services/account.services";
import { User } from "../dtos/user.dto";
import { user } from "../services/user.services";
import { createHash } from "../utils/passwordUtils";
import { Account } from "../dtos/account.dto";

export async function getUser(req: Request, res: Response) {
  res.send([]);
}

export async function createUser(
  req: Request<{}, {}, User & Account>,
  res: Response
) {
  try {
    const { username, password, name, phone } = req.body;
    console.log(username);
    const passwordHash = await createHash(password);
    const accountType = "user";
    //create account
    const accountId = await account.create({
      username,
      password: passwordHash,
      accountType,
    });

    //create user
    const userId = await user.create({ name, phone, accountId });

    res.status(201).send(JSON.stringify({ userId }));
  } catch (error) {
    res.status(500).send({ message: "server error, user not created", error });
  }
}
