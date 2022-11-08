import { basicHeaderValidation } from './basicHeader';
import { jwtHeaderValidation } from './jwtHeader';

export default {
  basicHeader: basicHeaderValidation,
  jwtHeader: jwtHeaderValidation,
};
