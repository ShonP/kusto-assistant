import { ulid as ulidGenerator } from 'ulid';

export const ulid = (): string => {
  return ulidGenerator();
};
