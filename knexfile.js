// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

export const development = {
  client: 'postgresql',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
  migrations,
};

export const test = {
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
  // debug: true,
  migrations,
};

export const production = {
  client: 'sqlite3',
  connection: 'postgres://zhdpyutkrlamrr:3884948a6251087db78eb9a0032b8d1ca9a781856e8de2feedadecf7e5e710bb@ec2-3-209-61-239.compute-1.amazonaws.com:5432/d499f54if4ni9v',
  useNullAsDefault: true,
  migrations,
};
