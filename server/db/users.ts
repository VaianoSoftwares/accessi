import { BaseError } from "../types/errors.js";
import { PostazioneUser, User } from "../types/users.js";
import {
  InsertUserData,
  UpdateUserData,
  UpdPostazioniUserData,
} from "../utils/validation.js";
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

    const insertUserPostValues = Object.values(data.postazioniIds).flatMap(
      (value) => [userId, value]
    );
    const insertUserPostText =
      "INSERT INTO postazioni_user (user_id, post_id) VALUES ".concat(
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

export async function updateUser({ id: userId, updateValues }: UpdateUserData) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const userToUpd = await client.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    if (!userToUpd.rowCount) {
      throw new BaseError("Utente non esistente", {
        status: 400,
        context: { userId },
      });
    }

    const { queryText: updUsersQueryText, queryValues: updUsersQueryValues } =
      db.getUpdateRowsQuery(
        "users",
        { ...updateValues, postazioni: undefined },
        { id: userId }
      );
    const updateUserRes = await client.query<User>(
      updUsersQueryText,
      updUsersQueryValues
    );

    const { rows: userPostazioni } = await client.query<PostazioneUser>(
      "SELECT * FROM postazioni_user WHERE usr_id = $1",
      [userId]
    );

    const userPostazioniIds = userPostazioni.map((p) => p.post_id);
    const postazioniToAdd: number[] = [];
    const postazioniToRemove: number[] = [];
    updateValues.postazioniIds?.forEach(({ checked, post_id }) => {
      const found = userPostazioniIds.includes(post_id);
      if (!found && checked) postazioniToAdd.push(userId, post_id);
      else if (found && !checked) postazioniToRemove.push(userId, post_id);
    });

    const insertPostazioniText =
      postazioniToAdd.length > 0
        ? "INSERT INTO postazioni_user (usr_id, post_id) VALUES ".concat(
            postazioniToAdd
              .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
              .join(",")
          )
        : "";
    const deletePostazioniText =
      postazioniToRemove.length > 0
        ? "DELETE FROM postazioni_user WHERE usr_id = $1 AND ".concat(
            postazioniToRemove
              .map((_, i) => `postazione = $${i + 2}`)
              .join(" OR ")
          )
        : "";

    const insertPostazioniRes = await client.query(
      insertPostazioniText,
      postazioniToAdd
    );
    const deletePostazioniRes = await client.query(deletePostazioniText, [
      userId,
      ...postazioniToRemove,
    ]);

    if (
      !updateUserRes.rowCount &&
      !insertPostazioniRes.rowCount &&
      !deletePostazioniRes.rowCount
    ) {
      throw new BaseError("Impossibile modificare utente", {
        status: 500,
        context: { userId },
      });
    }

    await client.query("COMMIT");

    return {
      updatedUser: updateUserRes.rows[0],
      updatedPostazioni: {
        added: insertPostazioniRes.rows,
        removed: deletePostazioniRes.rows,
      },
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function updatePostazioniToUser(
  data: UpdPostazioniUserData,
  userId: number
) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const postazioniUser = await client.query<PostazioneUser>(
      "SELECT * FROM postazioni_user WHERE usr_id = $1",
      [userId]
    );
    if (postazioniUser.rowCount === 0) {
      throw new BaseError("Utente non ha accesso a nessuna postazione", {
        status: 500,
        context: { userId },
      });
    }

    const postazioniToUpd = postazioniUser.rows.map((p) => p.post_id);

    const postazioniToAdd: number[] = [];
    const postazioniToRemove: number[] = [];
    data.forEach(({ checked, post_id }) => {
      const found = postazioniToUpd.includes(post_id);
      if (!found && checked) postazioniToAdd.push(userId, post_id);
      else if (found && !checked) postazioniToRemove.push(userId, post_id);
    });

    const insertPostazioniText =
      "INSERT INTO postazioni_user (usr_id, post_id) VALUES ".concat(
        postazioniToAdd
          .map((_, i) => (i & 1 ? `$${i + 1})` : `($${i + 1}`))
          .join(",")
      );
    const deletePostazioniText =
      "DELETE FROM postazioni_user WHERE usr_id = $1 AND ".concat(
        postazioniToRemove.map((_, i) => `post_id = $${i + 2}`).join(" OR ")
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
