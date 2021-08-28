import pino from 'pino'
import pg from 'pg'
// This file is automatically generated using schemats

import { Tables, CustomTypes, Animal } from './db-types'
import { TypedPostgresPool, TypedPostgresClient } from '../src'

const main = async () => {
    const logger = pino()

    // This creates 
    const connectionParams: pg.PoolConfig = {}
    const pool = new TypedPostgresPool<Tables, CustomTypes>(connectionParams, logger)
    const database = new TypedPostgresClient(pool, logger)

    // This is the pet uuid
    const id = 'uuid'

    // SELECT

    {
        // This returns an object of type Pick<DB.Pet, 'owner' | 'birthdate'>
        const { owner, birthdate } = await database.crudGet(
            'pet', 
            ['owner', 'birthdate', 'name'], 
            { id }, 
            new Error('Pet Not Found')
        )
        console.log(owner, birthdate)
    }

    {
        // This returns an array of type Pick<DB.Pet, 'owner' | 'birthdate'>[]
        const results = await database.crudGet(
            'pet', 
            ['owner', 'birthdate', 'owner'], 
            { id }
        )
        console.log(results)
    }

    {
        // This returns an array of type DB.Pet
        const { owner, birthdate } = await database.crudGetAll(
            'pet', 
            { id },
            new Error('Pet Not Found')
        )
        console.log(owner, birthdate)
    }

    {
        // This returns an array of type DB.Pet[]
        const results = await database.crudGetAll(
            'pet', 
            { id }
        )
        console.log(results)
    }

    // UPDATE

    // This updates the pet
    await database.crudUpdate('pet', {
        lastSeenLocation: { x: 50, y: 20 }
    }, { id })

    // This updates the pet but throws an error if it isn't exactly
    // one pet that was updated
    await database.crudUpdate('pet', {
        lastSeenLocation: { x: 50, y: 20 }
    }, { id}, new Error('Pet not updated'))

    // INSERT

    // This inserts the pet and returns the id
    {
        const { id: petId } = await database.crudInsert('pet', {
            name: 'Bob',
            type: Animal.Dog
        }, ['id'])
        console.log(petId)
    }

    // DELETE

    {
        // This delets the pet and returns whatever values
        await database.crudDelete('pet', { id }, ['id', 'owner', 'moreRandomFacts'], new Error('Pet not Found'))
    }

    // Basic Query Helpers

    // Currently we just provide createFields and selectField methods
    await database.query<any>(
        ({ cf, sf }) => `
            SELECT 
                ${sf('pet', ['id', 'name'], 'p')}, 
                json_build_object(
                    'pet': json_build_object(${cf('pet', ['id', 'name'], 'p')}),
                    'owner': json_build_object(${cf('user', ['id', 'name'])})
                )
            FROM pet_store.pet as p
            JOIN pet_store.user on user.id = pet.owner
            WHERE name = $1
        `,
        ['bob']
    )
    
    // But you can also use the normal pg-node query
    await database.query(`SELECT * FROM pet_store`)

    // With .one and .many as utils
    await database.one(`SELECT * FROM pet_store`, ['name'], new Error('Not Found'))

    // With .one and .many as utils
    await database.many(`SELECT * FROM pet_store`, ['name'])

     
    await database.crudGet('pet', ['name', 'owner'], { id: '12'}, new Error('no found'))
}

main()