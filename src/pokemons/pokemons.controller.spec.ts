import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

const mockPokemons: Pokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    type: 'grass',
    hp: 45,
    sprites: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
    ],
  },
  {
    id: 2,
    name: 'ivysaur',
    type: 'grass',
    hp: 60,
    sprites: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
    ],
  },
];

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('shold been called with correct parameters', async () => {
    const dto = { limit: 10, page: 1 };
    jest.spyOn(service, 'findAll');
    await controller.findAll(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalledWith(dto);
  });

  it('shold been called the service and check the result', async () => {
    const dto = { limit: 10, page: 1 };
    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(mockPokemons));

    const pokemons = await controller.findAll(dto);

    expect(pokemons).toBe(mockPokemons);
    expect(pokemons.length).toBe(mockPokemons.length);
  });

  it('should have call the service with the correct id (findOne)', async () => {
    const id = '4';
    const spy = jest.spyOn(service, 'findOne');

    await controller.findOne(id);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(+id);
  });

  it('should have call the service with the correct id and data (update)', async () => {
    const id = '4';
    const updatePokemonDto = {};

    const spy = jest.spyOn(service, 'update');

    await controller.update(id, updatePokemonDto);

    expect(spy).toHaveBeenCalledWith(+id, updatePokemonDto);
    // expect(result).toEqual(
    //   expect.objectContaining({
    //     id: +id,
    //   }),
    // );
  });

  it('should have call the service with the correct id (delete)', async () => {
    const id = '4';

    const spy = jest.spyOn(service, 'remove');

    const result = await controller.remove(id);
    const pokemon = await service.findOne(+id);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(+id);
    expect(result).toBe(`Pokemon ${pokemon.name} removed!`);
  });

  it('should have call the service with the correct parameters to create', async () => {
    const createPokemonDto: CreatePokemonDto = {
      name: 'Pikachu',
      type: 'Electric',
    };

    const spy = jest.spyOn(service, 'create');

    await controller.create(createPokemonDto);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(createPokemonDto);
    // expect(result).toEqual({
    //   ...createPokemonDto,
    //   sprites: [],
    //   hp: 0,
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   id: expect.any(Number),
    // });
  });
});
