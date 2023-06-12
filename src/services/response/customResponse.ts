import i18nService from "../i18n";

export default class CustomResponse implements CustomResponse {
  error = false;
  data: any = null;
  errors: ErrorObject[] = [];

  constructor(data?: any, errors?: any, lang = "en") {
    // Init i18n service
    const i18n: any = global.i18n;

    // Response error
    if (errors) {
      this.error = true;
      this.errors = this.getErrorResponse(i18n, errors, lang);
    } else {
      // Response success data
      this.data = data;
    }
  }

  // Get error response data
  private getErrorResponse(i18n: i18nService, data: any, lang?: string): ErrorObject[] {
    const errors = [];

    // Code arrays
    if (typeof data === "object") {
      data.map((code: string) => {
        errors.push(this.getError(i18n, code, lang));
      });
    } else {
      // String (error code string or message string)
      errors.push(this.getError(i18n, data, lang));
    }

    return errors;
  }

  // Get error translate by language
  private getError(i18n: i18nService, data: any, lang = "en"): ErrorObject {
    // Translate the error
    let error = i18n.translate(data, lang);

    let errorObject = null;

    if (error && error.code) {
      errorObject = {
        code: error.code,
        message: error.message,
      };
    } else {
      // Translate the error
      error = i18n.translate("system.customMessage", lang);

      errorObject = {
        code: error.code,
        message: data,
      };
    }

    return errorObject;
  }
}
