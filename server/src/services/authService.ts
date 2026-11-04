import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { encargadoRepository } from '../infrastructure/repositories/encargadoRepository';

export const authService = {

  async login(codigo_identificacion: string, contrasena: string) {
    const encargado = await encargadoRepository.buscarPorCodigo(codigo_identificacion);
    if (!encargado) {
      throw new Error('Credenciales inválidas');
    }

    const contrasenaValida = await bcrypt.compare(contrasena, encargado.contrasena_hash);
    if (!contrasenaValida) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id_encargado: encargado.id_encargado,
        rol: encargado.rol
      },
      config.jwtSecret,
      { expiresIn: '8h' }
    );

    return {
      token,
      encargado: {
        id_encargado: encargado.id_encargado,
        nombre: encargado.nombre,
        rol: encargado.rol
      }
    };
  }

};