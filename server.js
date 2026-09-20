// Room relay: no sensor values are persisted. The host and two phones exchange only
// role-tagged live inputs and the host feedback snapshot for their room.
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const app = express();
const server = require('http').createServer(app);
const io = new Server(server, { cors: { origin: true, methods: ['GET', 'POST'] } });
const rooms = new Map();
function getRoom(id) { if (!rooms.has(id)) rooms.set(id, { host: null, players: new Map() }); return rooms.get(id); }
function presence(id) { const r = getRoom(id); return { A: r.players.has('A'), B: r.players.has('B') }; }
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/health', (_, res) => res.json({ ok: true }));
io.on('connection', socket => {
  socket.on('join-room', ({ room, role }) => {
    if (!/^[A-Z0-9]{4,12}$/.test(room || '') || !['host', 'A', 'B'].includes(role)) return socket.emit('room-error', 'Invalid room or role');
    if (socket.data.room) socket.leave(socket.data.room);
    socket.data.room = room; socket.data.role = role; socket.join(room);
    const r = getRoom(room);
    if (role === 'host') r.host = socket.id; else r.players.set(role, socket.id);
    io.to(room).emit('presence', presence(room));
    socket.emit('joined', { room, role, presence: presence(room) });
  });
  socket.on('player-input', payload => {
    const { room, role } = socket.data;
    if (!room || !['A', 'B'].includes(role)) return;
    const value = Math.max(0, Math.min(100, Number(payload?.value) || 0));
    const raw = Number(payload?.raw) || value;
    io.to(room).emit('player-input', { role, value, raw, timestamp: Date.now() });
  });
  socket.on('host-feedback', snapshot => { if (socket.data.role === 'host' && socket.data.room) socket.to(socket.data.room).emit('host-feedback', snapshot); });
  socket.on('disconnect', () => {
    const { room, role } = socket.data; if (!room) return; const r = getRoom(room);
    if (role === 'host' && r.host === socket.id) r.host = null;
    if (['A', 'B'].includes(role) && r.players.get(role) === socket.id) r.players.delete(role);
    io.to(room).emit('presence', presence(room));
    if (!r.host && r.players.size === 0) rooms.delete(room);
  });
});
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`UCM Co-op Lab on :${port}`));
