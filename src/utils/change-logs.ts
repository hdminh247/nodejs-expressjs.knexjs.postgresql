import ApplicationChangeLogs from "../models/application-change-logs";

interface Value {
  oldValue?: number;
  newValue?: number;
  rawOldValue: string;
  rawNewValue: string;
  fieldName?: string;
}

export enum Type {
  Status = "applicationStatus",
  Survey = "survey",
}

export const logChanges = async (applicationId: number, type: Type, userId: number, value: Value) => {
  return await ApplicationChangeLogs.query().insert({ applicationId, type, userId, ...value });
};
