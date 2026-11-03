import { config } from './config';
import app from './app';
import { prisma } from './config/prisma';
import type { Server as HttpServer } from 'node:http';

let server: HttpServer | undefined;

const startServer = async () => {
  try {
    await prisma.$connect();
    server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log('🗄️ PostgreSQL database connected');
    });
  } catch (error) {
    console.error('Failed to connect to the PostgreSQL database:', error);
    await prisma.$disconnect();
    process.exitCode = 1;
  }
};

void startServer();

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      void prisma.$disconnect().then(() => {
        console.log('Server closed.');
        process.exit(0);
      }).catch(error => {
        console.error('Failed to disconnect from the database:', error);
        process.exit(1);
      });
    });
  } else {
    void prisma.$disconnect().then(() => process.exit(0));
  }

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

export default server;