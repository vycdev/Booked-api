import Router from "../Router";
import { requireTeacher } from "../auth/middleware/requireTeacher";
import addHw from "./actions/addHw";
import { validateSchema } from "../schema/middleware/validateSchema";
import { homeworkBody } from "./schema/homeworkBody";
import { requireStudent } from "../auth/middleware/requireStudent";
import checkHwScore from "./actions/checkHwScore";
import completeHw from "./actions/completeHw";
import { HttpError } from "../../common/error/classes/httpError";
import getAllHwForUser from "./actions/getAllHwForUser";
import { requireAuthenticated } from "../auth/middleware/requireAuthenticated";
import getHwForClass from "./actions/getHwForClass";

const router = new Router({ prefix: "/homework" });

router.post(
    "/addHW",
    requireTeacher(),
    validateSchema(homeworkBody, "body"),
    async (ctx, next) => {
        const { classid, name, dueDate, questions } = ctx.request.body;
        await addHw(classid, name, dueDate, questions);
        ctx.status = 201;
        ctx.body = {
            message: "Successfully added homework"
        };
        await next();
    }
);

router.post("/completeHW", requireStudent(), async (ctx, next) => {
    const { user } = ctx.session!;
    const { homeworkid, choices } = ctx.request.body;
    const resp = await completeHw(user, homeworkid, choices);
    if (resp === null) {
        throw new HttpError(400, "You can't complete that");
    }
    ctx.status = 200;
    ctx.body = {
        message: `You have completed an assignment! Your grade was ${resp.score}`
    };
    await next();
});

router.get("/allHWForUser", requireStudent(), async (ctx, next) => {
    const { user } = ctx.session!;
    const homework = await getAllHwForUser(user);
    if (!homework) {
        // I put this because I have no idea what happens if homework is null, that only happens if the user id is invalid
        throw new HttpError(400, "Something went wrong");
    }
    ctx.status = 200;
    ctx.body = homework;
    await next();
});

router.get(
    "/hwForClass/:classid",
    requireAuthenticated(),
    async (ctx, next) => {
        const { user } = ctx.session!;
        const { classid } = ctx.params;
        const resp = await getHwForClass(user, classid);
        if (!resp) {
            throw new HttpError(400, "You can't access that class data");
        }
        ctx.status = 200;
        ctx.body = resp;
        await next();
    }
);

export default router.routes();