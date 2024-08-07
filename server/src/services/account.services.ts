import { Account } from "../dtos/account.dto";
import {
  checkAccountExist,
  createAccount,
  getAccountId,
  getAccountType,
  getPasswordFromTable,
} from "../model/account.model";

export async function create(account: Account): Promise<string> {
  return createAccount(account);
}

export async function checkUsername(username: string): Promise<boolean> {
  return checkAccountExist(username);
}

export async function getPassword(username: string): Promise<string> {
  return getPasswordFromTable(username);
}

export async function getId(username: string): Promise<string> {
  return getAccountId(username);
}

export async function type(id: string): Promise<string> {
  return getAccountType(id);
}

export async function insert(account: Account) {}

export const account = {
  create,
  insert,
  checkUsername,
  getPassword,
  getId,
  type,
};
