import knex from "../../../../db/knex";
import User from "../types/User";

export default async (userid: number, classid: number) => {
    const user = await knex<User>("users")
        .where({ id: userid })
        .first();
    if (!user) {
        return null;
    }
    if (user.classes.includes(classid)) {
        return false;
    }
    await knex.raw("array_append(classes, ?)", [classid]);
};