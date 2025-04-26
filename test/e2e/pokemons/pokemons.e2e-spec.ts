import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/pokemons (POST) without body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const messageArray: string[] = response.body.message ?? [];
    expect(response.statusCode).toBe(400);

    expect(messageArray).toContain('name must be a string');
    expect(messageArray).toContain('name should not be empty');
    expect(messageArray).toContain('type must be a string');
    expect(messageArray).toContain('type should not be empty');
  });

  it('/pokemons (POST) with correct body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons').send({
      name: 'Pikachu',
      type: 'Electric',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const messageArray: string[] = response.body.message ?? [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const res = response.body;

    expect(response.statusCode).toBe(201);
    expect(messageArray.length).toBe(0);
    expect(res).toEqual(
      expect.objectContaining({
        name: 'Pikachu',
        type: 'Electric',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(Number),
      }),
    );
  });

  it('/pokemons (GET) Get list of paginated Pokemons', async () => {
    const response = await request(app.getHttpServer()).get('/pokemons').query({
      limit: 5,
      page: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.length).toBe(5);
    expect(response.body).toBeInstanceOf(Array);

    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('type');
      expect(pokemon).toHaveProperty('hp');
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('sprites');
    });
  });

  it('/pokemons/:id (GET) should return a pokemon by ID', async () => {
    const id = 1;
    const response = await request(app.getHttpServer()).get(`/pokemons/${id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.id).toBe(id);
  });

  it('/pokemons/:id (GET) should return not found', async () => {
    const id = 100_000_000;
    const response = await request(app.getHttpServer()).get(`/pokemons/${id}`);

    expect(response.statusCode).toBe(404);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBe(`Pokemon with id ${id} not found`);
  });

  it('/pokemons/:id (PATCH) should update a pokemon', async () => {
    const id = 4;
    const responseCurrent = await request(app.getHttpServer()).get(
      `/pokemons/${id}`,
    );
    const currentPokemon = responseCurrent.body as Pokemon;

    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${id}`)
      .send({
        name: 'Pokemon editado',
        type: 'Electric',
      });

    const updatedPokemon = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(currentPokemon.id).toBe(updatedPokemon.id);
    expect(currentPokemon.hp).toBe(updatedPokemon.hp);
    expect(updatedPokemon.name).toBe('Pokemon editado');
    expect(updatedPokemon.type).toBe('Electric');
    expect(updatedPokemon.id).toBe(id);
  });

  it('/pokemons/:id (PATCH) should thrown an 404', async () => {
    const id = 4000000;
    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${id}`)
      .send({
        name: 'Pokemon editado',
        type: 'Electric',
      });

    expect(response.statusCode).toBe(404);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBe(`Pokemon with id ${id} not found`);
  });

  it('/pokemons/:id (DELETE) should deletes a pokemon', async () => {
    const id = 1;
    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${id}`,
    );

    expect(response.statusCode).toBe(200);
  });

  it('/pokemons/:id (DELETE) should return not found', async () => {
    const id = 40000000;
    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${id}`,
    );

    expect(response.statusCode).toBe(404);
  });
});
