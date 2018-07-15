// tests

import 'mocha';
import * as assert from 'assert';
import { Client } from 'pg';

import { isFD } from '../logic';

const client = new Client();
client.connect();

describe('app tests', () => {
  before(async () => {
    // todo before tests (if any)
    // should initialize and populate database for tests
  });

  after(async () => {
    // todo after tests (if any)
    // should delete test database
  });

  // we can test this function without the need for a test database
  it('should test isFD function', async () => {
    const exists = await client.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = \'final_draw\');');
    const respFunction = await isFD();

    assert.equal(respFunction, !!exists.rows.exists, 'should have the same value');
  });
});