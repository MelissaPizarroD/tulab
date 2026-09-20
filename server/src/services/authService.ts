import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encargadoRepository } from '../infrastructure/repositories/encargadoRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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
      JWT_SECRET,
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