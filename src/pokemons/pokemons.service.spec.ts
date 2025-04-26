import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

describe('PokemonsService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should adds a pokemon', async () => {
    const data = { name: 'Pikachu', type: 'Electric' };
    const result = await service.create(data);
    expect(result).toStrictEqual({
      ...data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
      hp: 0,
      sprites: [],
    });
  });

  it('should return a pokemon', async () => {
    const id = 4;
    const result = await service.findOne(id);
    let pokemon = new Pokemon();
    pokemon = result;
    expect(pokemon.id).toBe(id);
  });

  it('should check properties of a pokemon', async () => {
    const id = 4;
    const pokemon = await service.findOne(id);

    expect(pokemon).toHaveProperty('id');
    expect(pokemon).toHaveProperty('name');

    expect(pokemon).toEqual(
      expect.objectContaining({
        id: id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name: expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        hp: expect.any(Number),
      }),
    );
  });

  it('it should return 404 when pokemon is not found', async () => {
    const id = 4000;
    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(id)).rejects.toThrow(
      `Pokemon with id ${id} not found`,
    );
  });

  it('it should return paginated pokemons and cache them', async () => {
    const data = { limit: 10, page: 1 };
    const pokemons = await service.findAll(data);
    const cache_key = `${data.limit}-${data.page}`;

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(data.limit);

    expect(service.paginatedPokemonsCache.has(cache_key)).toBeTruthy();
    expect(service.paginatedPokemonsCache.get(cache_key)).toEqual(pokemons);
  });

  it('it should return paginated pokemons in cache and not pass the limit and page', async () => {
    const cacheSpy = jest.spyOn(service.paginatedPokemonsCache, 'get');
    const fetchSpy = jest.spyOn(global, 'fetch');

    await service.findAll({ limit: undefined, page: undefined });
    await service.findAll({ limit: 10, page: 1 });

    expect(cacheSpy).toHaveBeenCalledWith('10-1');
    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(11);
  });

  it('it should return an error when the create pokemon already exists', async () => {
    const pokemon = {
      id: new Date().getTime(),
      name: 'Pikachu',
      type: 'Electric',
      hp: 0,
      sprites: [],
    };

    const { id, ...rest } = pokemon;
    service.pokemonsCache.set(id, pokemon);

    try {
      await service.create(rest);
      throw new Error('esto no deberia pasar, error en el test');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(
        `Pokemon with name ${pokemon.name} already exists`,
      );
    }
  });

  it('should return pokemon in cache when already exist in it', async () => {
    const id = 25;
    const cacheSpy = jest.spyOn(service.pokemonsCache, 'get');

    await service.findOne(id);
    const resCache = await service.findOne(id);
    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(resCache).toEqual(
      expect.objectContaining({
        id,
      }),
    );
  });

  it('should update pokemon', async () => {
    const id = 1;
    const dto: UpdatePokemonDto = { name: 'Charmander 2' };

    const updatedPokemon = await service.update(id, dto);

    expect(updatedPokemon).toEqual({
      id: 1,
      name: dto.name,
      type: 'grass',
      hp: 45,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
      ],
    });
  });

  it('should not update pokemon if not exists', async () => {
    const id = 1_000_000;
    const dto: UpdatePokemonDto = { name: 'Charmander 2' };

    try {
      await service.update(id, dto);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(`Pokemon with id ${id} not found`);
    }
  });

  it('should removed pokemon from caché', async () => {
    const id = 1;
    await service.findOne(id);

    await service.remove(id);

    expect(service.pokemonsCache.get(id)).toBeUndefined();
  });
});
