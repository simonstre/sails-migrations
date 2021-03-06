const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const SailsIntegration = require('./sails_integration');

const sailsToKnexClient = {
  'sails-postgresql': 'pg',
  'sails-mysql': 'mysql'
};

function getModulesPath(basePath) {
  const baseAppPath = basePath || process.cwd();
  return path.join(baseAppPath, 'node_modules');
}

function getClientFromSailsConfig(sailsConfig) {
  var adapter;
  switch(sailsConfig.defaultAdapter.version) {
    case '0.10':
      adapter = sailsConfig.defaultAdapter.config.adapter;
      break;
    case '0.9':
      adapter = sailsConfig.defaultAdapter.identity;
      break;
  }
  return sailsToKnexClient[adapter];
}

function getConfigFromSailsConfig(sailsConfig) {
  const fullConfig = _.defaults({}, sailsConfig.defaultAdapter.config, sailsConfig.defaultAdapter.defaults);
  const client = getClientFromSailsConfig(sailsConfig);
  const connection = {
    host: fullConfig.host,
    user: fullConfig.user,
    port: fullConfig.port,
    database: fullConfig.database,
    password: fullConfig.password
  };

  const migrations = {
    tableName: 'sails_migrations',
    directory: './db/migrations'
  };

  const result = {
    client: client,
    connection: connection,
    migrations: migrations
  };

  return result;
}


function getConfig(basePath) {
  const modulesPath = getModulesPath(basePath);

  return Promise.promisify(SailsIntegration.loadSailsConfig)(modulesPath).then(getConfigFromSailsConfig);
}


exports.load = getConfig;