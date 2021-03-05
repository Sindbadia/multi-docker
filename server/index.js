const keys = require('./keys')

// Export App Setup
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Postgres Client Setup
const { Pool } = require('pg')
const pgClient = new Pool({
  user: keys.postgresUser,
  password: keys.postgresPassword,
  host: keys.postgresHost,
  port: keys.postgresPort,
  database: keys.postgresDatabase,
})

pgClient.on('error', () => console.log('[!] Lost Postgres Connection'))

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err))

// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
})
const redisPublisher = redisClient.duplicate()

// Express route handlers
app.get('/', (req, res) => {
  res.json({ message: 'Hi' })
})

app.get('/values/all', async (req, res, next) => {
  const values = await pgClient.query('SELECT * FROM values')
  res.json(values.rows)
})

app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.json(values)
  })
})

app.post('/value', (req, res) => {
  const { index } = req.body
  if (parseInt(index) > 40) {
    return res.status(422).json({ error: 'Index must be less than 40' })
  }

  redisClient.hset('values', index, 'Nothing yet!')
  redisPublisher.publish('insert', index)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

  res.status(201).json({ working: true })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})

app.listen(5000, err => {
  console.log(`Listing on port 5000...`)
})
