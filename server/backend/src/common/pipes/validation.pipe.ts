import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

export const createValidationPipe = () => {
  return new NestValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    forbidUnknownValues: true,
    validationError: {
      target: false,
      value: false,
    },
  });
};
