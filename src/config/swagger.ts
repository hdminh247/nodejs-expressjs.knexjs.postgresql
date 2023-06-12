import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

export default function swagger(app: any) {
  // const swaggerDefinition = {
  //   info: {
  //     // API informations (required)
  //     title: "ERC APIs", // Title (required)
  //     version: "1.0.0", // Version (required)
  //   },
  //   basePath: "/api", // Base path (optional),
  //   securityDefinitions: {
  //     // Enable api key in header, using security: - auth: [] in jsdoc to enable check this
  //     auth: {
  //       type: "apiKey",
  //       in: "header",
  //       name: "Authorization",
  //     },
  //   },
  // };

  const openApiDefinition = {
    openapi: "3.0.0",
    info: {
      // API informations (required)
      title: "Swagger APIs", // Title (required)
      version: "1.0.0", // Version (required)
    },
    servers: [{ url: "/api/v1" }],
    securityDefinitions: {
      // Enable api key in header, using security: - auth: [] in jsdoc to enable check this
      auth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
      },
    },
  };

  const getCodeFilesByEnvironment = (env = "local") => {
    switch (env) {
      case "local": {
        return ["./src/controllers/*.ts"];
      }
      case "staging": {
        return ["./build/controllers/*.js"];
      }
      case "production": {
        return ["./build/controllers/*.js"];
      }
      default: {
        return ["./src/controllers/*.ts"];
      }
    }
  };

  const options = {
    definition: openApiDefinition,
    // swaggerDefinition,
    apis: getCodeFilesByEnvironment(process.env.NODE_ENV as string), // <-- not in the definition, but in the options
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
