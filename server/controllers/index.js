const common = require('./common');
const entities = require('./entities');
const users = require('./users');
const countries = require('./countries');
const companies = require('./companies');
const jobs = require('./jobs');
const applicants = require('./applicants');
const pools = require('./pools');
const teams = require('./teams');
const scorecard = require('./scorecard');
const roles = require('./roles');

function controllersFactory() {
  return {
    teams,
    pools,
    common,
    users,
    entities,
    countries,
    companies,
    jobs,
    applicants,
    scorecard,
    roles,
  };
}

module.exports = controllersFactory;
