import { CreatePokemonDto } from './create-pokemon.dto';
import { validate } from 'class-validator';

describe('CreatePokemonDto', () => {
  it('should validate with valid values', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should not validate with invalid name', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 6 as unknown as string;
    dto.type = 'Electric';

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors.some((error) => error.property === 'name')).toBeDefined();
  });

  it('should not validate with invalid type', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 5 as unknown as string;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors.some((error) => error.property === 'type')).toBeDefined();
  });

  it('should validate with optionals valid values', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = 100;
    dto.sprites = ['pikachu.png', 'pikachu_2.png'];

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should not validate with invalid hp', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = 'hola' as unknown as number;
    dto.sprites = ['pikachu.png', 'pikachu_2.png'];

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors.some((error) => error.property === 'hp')).toBeDefined();
  });

  it('should not validate with invalid sprites when some element is not string', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = 100;
    dto.sprites = ['pikachu.png', 5 as unknown as string];

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors.some((error) => error.property === 'sprites')).toBeDefined();
  });

  it('should not validate with invalid sprites when is not an array', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = 100;
    dto.sprites = 10 as unknown as string[];

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors.some((error) => error.property === 'sprites')).toBeDefined();
  });
});
