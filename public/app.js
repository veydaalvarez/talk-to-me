const socket = io();
const container = document.getElementById('container');

socket.on('new-transcription', (data) => {
  const line = document.createElement('div');
  line.className = 'line';
  
  const timestamp = document.createElement('span');
  timestamp.className = 'timestamp';
  timestamp.textContent = `[${data.timestamp}]`;
  
  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = data.text || data.speech;
  
  // line.appendChild(timestamp);
  line.appendChild(text);
  container.appendChild(line);
  

  container.scrollTop = container.scrollHeight;
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});