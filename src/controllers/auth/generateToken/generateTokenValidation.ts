type BasicHeaderValidation = (header: string) => {
  validationError?: string;
  credentials?: {
    username: string;
    password: string;
  };
};
const basicHeaderValidation: BasicHeaderValidation = (header) => {
  if (!header) {
    return { validationError: 'x-auth-basic header is missing from input' };
  }

  const encodedRegex = new RegExp('^Basic .+$');
  if (!encodedRegex.test(header)) {
    return { validationError: 'x-auth-basic must use Basic Auth' };
  }
  const decodedRegex = new RegExp('^[A-Za-z0-9-_]+[:].*$');
  const headerSplit = header.split(' ');
  const encodedCredentials = Buffer.from(headerSplit[1], 'base64');
  const decodedCredentials = encodedCredentials.toString('ascii');
  if (!decodedRegex.test(decodedCredentials)) {
    return { validationError: 'x-auth-basic credentials have invalid format' };
  }

  const credentials = decodedCredentials.split(/:(.*)/);
  return {
    credentials: {
      username: credentials[0],
      password: credentials[1],
    },
  };
};

export default basicHeaderValidation;
