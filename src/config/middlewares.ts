import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

export default function middlewares(app: any) {
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", parameterLimit: 50000, extended: false }));
  app.use(cookieParser());
  app.use(cors());
}
