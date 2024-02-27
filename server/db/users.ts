import { BaseError } from "../types/errors.js";
import {
  Postazione,
  PostazioneUser,
  UpdateUserData,
  User,
} from "../types/users.js";
import { InsertUserData, UpdPostazioniUserData } from "../utils/validation.js";
import * as db from "./index.js";

const fullUsersQuery = "SELECT * FROM full_users";

export async function getAllUsers() {
  return await db.query<User>(
    `${fullUsersQuery} WHERE id != 1 OR name != 'admin'`
  );
}

export async function getUserById(id: number) {
  return await db.query<User>(`${fullUsersQuery} WHERE id = $1`, [id]);
}

export async function getUserByName(name: string) {
  return await db.query<User>(`${fullUsersQuery} WHERE name = $1`, [name]);
}

export async function addUser(data: InsertUserData) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const insertUserText =
      "INSERT INTO users (name, password, permessi, pages) VALUES ($1, $2, $3, $4) RETURNING *";
    const insertUserValues = [
      data.name,
      data.password,
      data.permessi,
      data.pages,
    ];

    const insertUserRes = await client.query<User>(
      insertUserText,
      insertUserValues
    );
    if (insertUserRes.rowCount === 0) {
      throw new BaseError("Impossibile aggiungere utente", {
        status: 500,
        context: { name: data.name },
      });
    }

    const userId = insertUserRes.rows[0].id;

    const insertUserPostValues = Object.values(data.postazioni).flatMap(
      (value) => [userId, value]
    );
    const insertUserPostText =
      "INSERT INTO postazioni_user (user_id, postazione) VALUES ".concat(
        insertUserPostValues
          .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
          .join(",")
      );

    const insertUserPostRes = await client.query(
      insertUserPostText,
      insertUserPostValues
    );
    if (insertUserPostRes.rowCount === 0) {
      throw new BaseError("Impossibile aggiungere postazione_user", {
        status: 500,
        context: { userId },
      });
    }

    await client.query("COMMIT");

    return { user: insertUserRes, postazioniUser: insertUserPostRes };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function updateUser(data: UpdateUserData, filter?: object) {
  return await db.updateRows("users", data, filter);
}

export async function updatePostazioniToUser(
  data: UpdPostazioniUserData,
  userId: number
) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const postazioniUser = await client.query<PostazioneUser>(
      "SELECT * FROM postazioni_user WHERE user_id = $1",
      [userId]
    );
    if (postazioniUser.rowCount === 0) {
      throw new BaseError("Utente non ha accesso a nessuna postazione", {
        status: 500,
        context: { userId },
      });
    }

    const postazioniToUpd = postazioniUser.rows.map((p) => p.postazione);

    const postazioniToAdd: number[] = [];
    const postazioniToRemove: number[] = [];
    data.forEach(({ checked, postazione }) => {
      const found = postazioniToUpd.includes(postazione);
      if (!found && checked) postazioniToAdd.push(userId, postazione);
      else if (found && !checked) postazioniToRemove.push(userId, postazione);
    });

    const insertPostazioniText =
      "INSERT INTO postazioni_user (user_id, postazione) VALUES ".concat(
        postazioniToAdd
          .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
          .join(",")
      );
    const deletePostazioniText =
      "DELETE FROM postazioni_user WHERE user_id = $1 AND ".concat(
        postazioniToRemove.map((_, i) => `postazione = $${i + 2}`).join(" OR ")
      );

    const insertPostazioniRes = await client.query(
      insertPostazioniText,
      postazioniToAdd
    );
    const deletePostazioniRes = await client.query(deletePostazioniText, [
      userId,
      ...postazioniToRemove,
    ]);

    await client.query("COMMIT");

    return { added: insertPostazioniRes, removed: deletePostazioniRes };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function deleteUser(id: number) {
  return await db.deleteRows<User>("users", { id });
}

export async function deletePostazioneToUser(deleteData: PostazioneUser) {
  return await db.deleteRows<PostazioneUser>("postazioni_users", deleteData);
}
