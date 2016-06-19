const r = require('rethinkdb');

const bioord = require('./bioord.json')
const movies = require('./movies.json')

r.connect({ host: 'localhost', port: 63164 }, (err, conn) => {
  if(err) throw err;


  const createTables = () => {
    return r.db('itbio').tableCreate('movies').run(conn)
      .then(() => r.db('itbio').table('movies').insert(movies).run(conn))
      .then(() => r.db('itbio').tableCreate('bioord').run(conn))
      .then(() => r.db('itbio').table('bioord').insert(bioord).run(conn))
  }

  Promise.all([
    r.db('itbio').tableDrop('movies').run(conn),
    r.db('itbio').tableDrop('bioord').run(conn)
  ])
  .catch(() => {})
  .then(createTables)
  .catch(console.error)
  .then(() => conn.close())


});