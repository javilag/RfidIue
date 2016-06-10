var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var conString = require(path.join(__dirname, '../', '../', 'models/database.js'));
