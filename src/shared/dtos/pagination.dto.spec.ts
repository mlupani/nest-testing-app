import 'reflect-metadata';

import { validate } from 'class-validator';
//import { plainToInstance } from 'class-transformer';

import { PaginationDto } from './pagination.dto';
import { plainToInstance } from 'class-transformer';

describe('PaginationDto', () => {
  it('should validate with default values', async () => {
    const dto = new PaginationDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate with valid data', async () => {
    const dto = new PaginationDto();
    dto.page = 1;
    dto.limit = 10;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate with invalid page', async () => {
    const dto = new PaginationDto();
    dto.page = -1;
    dto.limit = 10;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors.some((error) => error.property === 'page')).toBeDefined();
  });

  it('should not validate with invalid limit', async () => {
    const dto = new PaginationDto();
    dto.page = 1;
    dto.limit = -1;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('limit');
  });

  it('should convert strings into numbers', async () => {
    const input = { limit: '10', page: '2' };
    const dto = plainToInstance(PaginationDto, input);

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(10);
    expect(dto.page).toBe(2);
  });
});
