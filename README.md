## A. Installing Dependencies

- Install all related packages. Navigate to root folder run this command:

```
npm install
```

or

```
yarn install
```

- Run the following commands depending on which environment you are running on

```
 cp env.sample.local .env
```

or

```
 cp env.sample.prod .env
```

- Update settings in the new `.env` file

NOTE: If you are running  in prod environment, install `pm2` to manage node process later. This will be instructed in the next part.

```
npm install pm2@latest -g
```

## B. Database Configurations
Run migration

```
yarn knex:migrate:latest
```

Execute seeder

```
yarn knex seed:run
```

To run specific seeder, you can find available seed files in `src/seeds`, then run seed CLI with desired file name

```
knex seed:run --specific=1_0_seed_roles.ts
```

To rollback migration, run

```
knex:migrate:rollback
```

## B. Running Application

##### 1) Development on local machine

At the root of project, run this command:

```
  yarn dev
```

Or

```
  npm run dev
```

##### 2) Production managed with pm2

```
    pm2 start ./build/server.js --name api
```

- To see production logs, run
```
pm2 logs
```

- To see created pm2 instances, run
```
pm2 ls
```

- To see both log and created pm2 instances, run
```
pm2 monit
```
