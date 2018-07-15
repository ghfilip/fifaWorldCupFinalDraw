Fifa World Cup Final Draw using Node.js and Express with TypeScript

- design and implement a Node.js app/program/system that simulates a soccer competition draw process (see https://en.wikipedia.org/wiki/2018_FIFA_World_Cup_seeding) based on an input endpoint, and provides some means to query data via other RESTful API endpoints

Problem:
Expose a basic Web interface that would allow a user to test the API. That is simple view with buttons/linksthat would:
 - Display the initial (before draw) pots;
 - Trigger the draw simulation;
 - Display the resulted groups;
 - Provide means to edit/delete things, etc
 
 requirements:
 - postgres DB
 run: CREATE TABLE input_data (
          id uuid primary key,
          iid varchar NOT NULL,
          name varchar NOT NULL,
          pot int NOT NULL
        );
        
 install:
 - npm i
 
 run server:
 - ts-node app.ts
 
 browser:
 - http://localhost:3000
 
 Note**: The app is just for test purposes. The design is rough (didn't invested time in this). Restfull methods may vary and may not be unitary. 
 
 