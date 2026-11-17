const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const dbPath = path.join(__dirname, 'test.db');
const db = new Database(dbPath, { readonly: true });

app.use(express.static('public'));

app.get('/api/transcriptions', (req, res) => {
  const transcriptions = db.prepare(`
    SELECT id, speech, audio_path 
    FROM audio_record 
    ORDER BY id DESC 
    LIMIT 100
  `).all();
  res.json(transcriptions);
});

let lastId = 0;

setInterval(() => {
  const latest = db.prepare(`
    SELECT id, speech, audio_path 
    FROM audio_record 
    WHERE id > ? 
    ORDER BY id ASC
  `).all(lastId);
  
  if (latest.length > 0) {
    latest.forEach(transcription => {
      io.emit('new-transcription', transcription);
      lastId = transcription.id;
    });
    console.log(`Pushed ${latest.length} new transcription(s)`);
  }
}, 2000);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const result = db.prepare('SELECT MAX(id) as maxId FROM audio_record').get();
  lastId = result.maxId || 0;
  console.log(`Watching for transcriptions after ID ${lastId}`);
});

