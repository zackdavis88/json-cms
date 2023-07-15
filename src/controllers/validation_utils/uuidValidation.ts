type UUIDValidation = (reqParamId: string, paramName: string) => string | void;

export const uuidValidation: UUIDValidation = (reqParamId, paramName) => {
  // Found this regex online for validating UUIDv4
  const uuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  if (!uuidRegex.test(reqParamId)) {
    return `requested ${paramName} id is not valid`;
  }
};
