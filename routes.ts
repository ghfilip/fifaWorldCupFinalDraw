// routes

import * as express from 'express';
import { check, validationResult } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import * as _ from 'underscore';

// import * as multer from 'multer';
// const upload = multer({ storage: multer.memoryStorage() })

export const routes = express.Router();

import {
  insertData,
  getData,
  truncateTable,
  finalDraw,
  isFD,
  getFDData,
  dropTable,
  updateValue,
  deleteEntry,
  isoCountries
} from './logic';

routes.put('/', [
  check('value')
    .isLength({ min: 3 })
    .withMessage('Team name is required.')
    .trim(),
  check('pk')
    .isLength({ min: 20 })
    .withMessage('ID is required.')
    .trim(),
], async (req, res) => {
  const errors = validationResult(req);

  const input_data = matchedData(req);

  if (errors.length) {
    // todo
  }

  await updateValue(input_data.pk, input_data.value);

  res.render('index', {
    data: {
      iso: isoCountries,
      list: {},
      fd: {},
    },
    errors: errors.mapped(),
  });
});

routes.post('/', async (req, res) => {
  const data = await getData();
  let finalData = null;

  if (data) {
    finalData = await finalDraw();
  }

  res.render('index', {
    data: {
      iso: isoCountries,
      list: data,
      fd: finalData,
    },
    errors: {},
  });
});

routes.get('/', async (req, res) => {
  const data = await getData();
  let finalData = null;

  if (await isFD()) {
    finalData = await getFDData();
  }

  res.render('index', {
    data: {
      iso: isoCountries,
      list: data,
      fd: finalData,
    },
    errors: {},
  });
});

routes.delete('/:id', [
  check('id')
    .isLength({ min: 20 })
    .withMessage('Team id is required for deletion.')
    .trim(),
], async (req, res) => {
  const teamToDelete = matchedData(req);

  await deleteEntry(teamToDelete.id);

  const data = await getData();
  let finalData = null;

  if (await isFD()) {
    finalData = await getFDData();
  }

  res.render('index', {
    data: {
      iso: isoCountries,
      list: data,
      fd: finalData,
    },
    errors: {},
  });
});

routes.get('/upload', (req, res) => {
  res.render('upload', {
    data: {},
    errors: {},
  });
});

routes.post('/upload', async (req, res) => {
  if (!req.files.input_file || req.files.input_file.mimetype !== 'application/json') {
    res.render('upload', {
      data: req.body,
      errors: {
        files: {
          msg: 'No JSON files were uploaded.',
        },
      },
    });

    return;
  }

  const data = JSON.parse(req.files.input_file.data);

  await truncateTable('input_data');

  _.map(data, (group) => {
    _.map(group, async (elem) => {
      await insertData(elem);
    });
  });

  // drop final draw table if exists
  if (await isFD()) {
    await dropTable('final_draw');
  }

  req.flash('success', 'File uploaded successfully!');
  res.redirect('/');

});