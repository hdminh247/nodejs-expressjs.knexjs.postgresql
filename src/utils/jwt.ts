import * as jwt from "jsonwebtoken";

export const generate = (content: any, options = {}) => jwt.sign(content, process.env.APP_SECRET as string, options);
export const verify = (token: string) => jwt.verify(token, process.env.APP_SECRET as string);
