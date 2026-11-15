import { Request } from 'express';

export const obtenerIp = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || '';
  if (ip === '::1') return '127.0.0.1';
  return ip.replace(/^::ffff:/, '');
};