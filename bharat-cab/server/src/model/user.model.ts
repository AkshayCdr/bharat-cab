// export async function getUserFromTable(username: string) {
//     const query = `SELECT * FROM USER WHERE accountId = $1`;
//     const values = [];
//     const result: QueryResult<Ride> = await (await client).query(query, values);
//     console.log(result.rows);
//     return result.rows[0];
// }
import { QueryResult } from "pg";
import { pool } from "../db";

import { User } from "../dtos/user.dto";
import { Id } from "../types/id";

const client = pool.connect();

export async function createUser(user: User): Promise<string> {
    try {
        const query = `INSERT INTO "USER" (account_id,name,email,phone) VALUES($1,$2,$3,$4) RETURNING account_id AS id`;
        const values = [user.accountId, user.name, user.email, user.phone];
        const result: QueryResult<Id> = await (
            await client
        ).query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error(error);
        throw new Error("Error inserting into user");
    }
}

export async function getUser(id: string): Promise<User> {
    try {
        console.log(id);
        const query = `SELECT * FROM "USER" WHERE account_id = $1`;

        const values = [id];
        const result: QueryResult<User> = await (
            await client
        ).query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error("Error inserting into user");
    }
}
