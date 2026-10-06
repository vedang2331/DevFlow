import http from 'http';
import app from './app';
import { config } from './config/env';
import { socketManager } from './sockets/socket.manager';

const server = http.createServer(app);

// Initialize Socket.IO engine
socketManager.init(server);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 DEVFLOW Backend API running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🔌 Socket.IO initialized`);
  console.log(`==================================================`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('💥 Unhandled Rejection:', err);
});
