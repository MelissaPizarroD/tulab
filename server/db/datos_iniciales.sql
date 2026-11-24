-- Datos iniciales de TuLab UdeC
-- Ejecutar una sola vez, después de schema.sql, sobre una base de datos vacía.
-- Antes de ejecutarlo, cambia el nombre, el código y la contraseña del encargado.

BEGIN;

-- Permite cifrar la contraseña con bcrypt desde PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Primer encargado de sala (con él se crean los equipos y recursos desde el panel)
INSERT INTO public.encargado (nombre, codigo_identificacion, contrasena_hash, rol)
VALUES ('Encargado Principal', 'ENC001', crypt('CambiaEstaClave123', gen_salt('bf', 10)), 'encargado_sala');

-- Usuario de consulta para el personal administrativo (opcional)
INSERT INTO public.encargado (nombre, codigo_identificacion, contrasena_hash, rol)
VALUES ('Administrativo', 'ADM001', crypt('CambiaEstaClave456', gen_salt('bf', 10)), 'administrativo');

-- Parámetros de operación
INSERT INTO public.configuracion_sistema (clave, valor, descripcion, ultima_modificacion)
VALUES ('tiempo_inactividad_minutos', '15', 'Minutos sin uso de teclado ni ratón antes de cerrar la sesión del equipo', NOW());

-- Recursos compartidos del laboratorio (se pueden agregar más desde el panel)
INSERT INTO public.recurso (nombre) VALUES
  ('Sala de estudio 1'),
  ('Sala de televisión');

COMMIT;