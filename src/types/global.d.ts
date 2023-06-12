// Global type define
declare namespace NodeJS {
  export interface Global {
    errorCodes: any; // Error codes and messages data
    i18n: any;
    socket: any // Hold current socket io instance,
  }
}
