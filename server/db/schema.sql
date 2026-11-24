--
-- PostgreSQL database dump
--

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cambio_encargado_turno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cambio_encargado_turno (
    id_cambio integer NOT NULL,
    id_turno integer NOT NULL,
    id_encargado_saliente integer NOT NULL,
    id_encargado_entrante integer NOT NULL,
    timestamp_cambio timestamp without time zone NOT NULL
);


--
-- Name: cambio_encargado_turno_id_cambio_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cambio_encargado_turno_id_cambio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cambio_encargado_turno_id_cambio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cambio_encargado_turno_id_cambio_seq OWNED BY public.cambio_encargado_turno.id_cambio;


--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_sistema (
    id_configuracion integer NOT NULL,
    clave character varying NOT NULL,
    valor character varying NOT NULL,
    descripcion text,
    ultima_modificacion timestamp without time zone NOT NULL,
    id_encargado_modifico integer
);


--
-- Name: configuracion_sistema_id_configuracion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_sistema_id_configuracion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_sistema_id_configuracion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_sistema_id_configuracion_seq OWNED BY public.configuracion_sistema.id_configuracion;


--
-- Name: dispositivo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispositivo (
    id_dispositivo integer NOT NULL,
    tipo character varying NOT NULL,
    nombre character varying NOT NULL,
    direccion_ip character varying NOT NULL,
    id_equipo integer,
    activo boolean DEFAULT true NOT NULL,
    fecha_registro timestamp without time zone NOT NULL,
    ultima_conexion timestamp without time zone,
    estado_conexion character varying DEFAULT 'desconectado'::character varying NOT NULL,
    CONSTRAINT dispositivo_estado_conexion_check CHECK (((estado_conexion)::text = ANY ((ARRAY['conectado'::character varying, 'desconectado'::character varying])::text[]))),
    CONSTRAINT dispositivo_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['terminal'::character varying, 'gestor_sesiones'::character varying])::text[])))
);


--
-- Name: dispositivo_id_dispositivo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dispositivo_id_dispositivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dispositivo_id_dispositivo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dispositivo_id_dispositivo_seq OWNED BY public.dispositivo.id_dispositivo;


--
-- Name: encargado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encargado (
    id_encargado integer NOT NULL,
    nombre character varying NOT NULL,
    codigo_identificacion character varying NOT NULL,
    contrasena_hash character varying NOT NULL,
    rol character varying NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT encargado_rol_check CHECK (((rol)::text = ANY ((ARRAY['encargado_sala'::character varying, 'administrativo'::character varying])::text[])))
);


--
-- Name: encargado_id_encargado_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encargado_id_encargado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: encargado_id_encargado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.encargado_id_encargado_seq OWNED BY public.encargado.id_encargado;


--
-- Name: equipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipo (
    id_equipo integer NOT NULL,
    numero_equipo integer NOT NULL,
    estado character varying NOT NULL,
    descripcion text,
    CONSTRAINT equipo_estado_check CHECK (((estado)::text = ANY ((ARRAY['disponible'::character varying, 'en_uso'::character varying, 'fuera_de_servicio'::character varying])::text[])))
);


--
-- Name: equipo_id_equipo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipo_id_equipo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipo_id_equipo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipo_id_equipo_seq OWNED BY public.equipo.id_equipo;


--
-- Name: estudiante; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estudiante (
    codigo_estudiantil character varying NOT NULL,
    nombre character varying NOT NULL,
    programa_academico character varying NOT NULL,
    correo_institucional character varying NOT NULL,
    semestre integer NOT NULL,
    telefono_contacto character varying,
    fecha_ultima_consulta timestamp without time zone
);


--
-- Name: intento_login; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intento_login (
    id_intento integer NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    codigo_usado character varying(50) NOT NULL,
    ip_origen character varying(45)
);


--
-- Name: intento_login_id_intento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.intento_login_id_intento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: intento_login_id_intento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.intento_login_id_intento_seq OWNED BY public.intento_login.id_intento;


--
-- Name: novedad_equipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.novedad_equipo (
    id_novedad integer NOT NULL,
    id_sesion integer NOT NULL,
    id_equipo integer NOT NULL,
    descripcion text NOT NULL,
    timestamp_reporte timestamp without time zone NOT NULL,
    codigo_estudiantil character varying(20),
    id_visitante integer
);


--
-- Name: novedad_equipo_id_novedad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.novedad_equipo_id_novedad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: novedad_equipo_id_novedad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.novedad_equipo_id_novedad_seq OWNED BY public.novedad_equipo.id_novedad;


--
-- Name: programacion_recurso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.programacion_recurso (
    id_programacion integer NOT NULL,
    id_turno integer NOT NULL,
    codigo_estudiantil character varying,
    id_visitante integer,
    tipo_recurso character varying,
    descripcion_recurso text,
    hora_estimada_disponibilidad time without time zone,
    estado character varying NOT NULL,
    id_recurso integer,
    hora_fin time without time zone,
    CONSTRAINT programacion_recurso_check CHECK ((((codigo_estudiantil IS NOT NULL) AND (id_visitante IS NULL)) OR ((codigo_estudiantil IS NULL) AND (id_visitante IS NOT NULL)))),
    CONSTRAINT programacion_recurso_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'asignado'::character varying, 'finalizado'::character varying, 'cancelado'::character varying])::text[])))
);


--
-- Name: programacion_recurso_id_programacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.programacion_recurso_id_programacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: programacion_recurso_id_programacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.programacion_recurso_id_programacion_seq OWNED BY public.programacion_recurso.id_programacion;


--
-- Name: recurso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurso (
    id_recurso integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: recurso_id_recurso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recurso_id_recurso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recurso_id_recurso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recurso_id_recurso_seq OWNED BY public.recurso.id_recurso;


--
-- Name: registro_acceso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registro_acceso (
    id_registro integer NOT NULL,
    codigo_estudiantil character varying,
    id_visitante integer,
    id_turno integer NOT NULL,
    id_dispositivo integer,
    hora_entrada timestamp without time zone NOT NULL,
    hora_salida timestamp without time zone,
    origen_registro character varying NOT NULL,
    estado character varying NOT NULL,
    ip_origen character varying(45),
    CONSTRAINT registro_acceso_check CHECK ((((codigo_estudiantil IS NOT NULL) AND (id_visitante IS NULL)) OR ((codigo_estudiantil IS NULL) AND (id_visitante IS NOT NULL)))),
    CONSTRAINT registro_acceso_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'cerrado'::character varying])::text[]))),
    CONSTRAINT registro_acceso_origen_registro_check CHECK (((origen_registro)::text = ANY ((ARRAY['terminal'::character varying, 'manual'::character varying])::text[])))
);


--
-- Name: registro_acceso_id_registro_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registro_acceso_id_registro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registro_acceso_id_registro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registro_acceso_id_registro_seq OWNED BY public.registro_acceso.id_registro;


--
-- Name: registro_bitacora; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registro_bitacora (
    id_entrada integer NOT NULL,
    id_turno integer NOT NULL,
    id_encargado integer NOT NULL,
    descripcion text NOT NULL,
    timestamp_registro timestamp without time zone NOT NULL,
    estado character varying NOT NULL,
    id_encargado_edicion integer,
    timestamp_edicion timestamp without time zone,
    CONSTRAINT registro_bitacora_estado_check CHECK (((estado)::text = ANY ((ARRAY['activa'::character varying, 'eliminada'::character varying])::text[])))
);


--
-- Name: registro_bitacora_id_entrada_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registro_bitacora_id_entrada_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registro_bitacora_id_entrada_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registro_bitacora_id_entrada_seq OWNED BY public.registro_bitacora.id_entrada;


--
-- Name: sesion_equipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesion_equipo (
    id_sesion integer NOT NULL,
    id_registro integer NOT NULL,
    id_equipo integer NOT NULL,
    id_dispositivo integer NOT NULL,
    hora_inicio timestamp without time zone NOT NULL,
    hora_cierre timestamp without time zone,
    estado character varying NOT NULL,
    motivo_cierre character varying,
    ip_origen character varying(45),
    CONSTRAINT sesion_equipo_estado_check CHECK (((estado)::text = ANY ((ARRAY['activa'::character varying, 'cerrada'::character varying])::text[]))),
    CONSTRAINT sesion_equipo_motivo_cierre_check CHECK (((motivo_cierre)::text = ANY ((ARRAY['manual'::character varying, 'inactividad'::character varying, 'cierre_turno'::character varying, 'apagado_equipo'::character varying, 'salida_terminal'::character varying])::text[])))
);


--
-- Name: sesion_equipo_id_sesion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sesion_equipo_id_sesion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sesion_equipo_id_sesion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sesion_equipo_id_sesion_seq OWNED BY public.sesion_equipo.id_sesion;


--
-- Name: turno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.turno (
    id_turno integer NOT NULL,
    id_encargado_apertura integer NOT NULL,
    id_encargado_cierre integer,
    fecha_apertura date NOT NULL,
    hora_apertura time without time zone NOT NULL,
    hora_cierre time without time zone,
    observaciones_apertura text,
    observaciones_cierre text,
    estado character varying NOT NULL,
    CONSTRAINT turno_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'cerrado'::character varying])::text[])))
);


--
-- Name: turno_id_turno_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.turno_id_turno_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: turno_id_turno_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.turno_id_turno_seq OWNED BY public.turno.id_turno;


--
-- Name: visitante; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visitante (
    id_visitante integer NOT NULL,
    nombre character varying NOT NULL,
    motivo_visita text,
    codigo_temporal character varying NOT NULL,
    timestamp_generacion timestamp without time zone NOT NULL,
    timestamp_expiracion timestamp without time zone NOT NULL,
    estado character varying NOT NULL,
    email character varying,
    telefono character varying,
    institucion character varying,
    CONSTRAINT visitante_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'expirado'::character varying])::text[])))
);


--
-- Name: visitante_id_visitante_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visitante_id_visitante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visitante_id_visitante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visitante_id_visitante_seq OWNED BY public.visitante.id_visitante;


--
-- Name: cambio_encargado_turno id_cambio; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambio_encargado_turno ALTER COLUMN id_cambio SET DEFAULT nextval('public.cambio_encargado_turno_id_cambio_seq'::regclass);


--
-- Name: configuracion_sistema id_configuracion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema ALTER COLUMN id_configuracion SET DEFAULT nextval('public.configuracion_sistema_id_configuracion_seq'::regclass);


--
-- Name: dispositivo id_dispositivo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispositivo ALTER COLUMN id_dispositivo SET DEFAULT nextval('public.dispositivo_id_dispositivo_seq'::regclass);


--
-- Name: encargado id_encargado; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encargado ALTER COLUMN id_encargado SET DEFAULT nextval('public.encargado_id_encargado_seq'::regclass);


--
-- Name: equipo id_equipo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo ALTER COLUMN id_equipo SET DEFAULT nextval('public.equipo_id_equipo_seq'::regclass);


--
-- Name: intento_login id_intento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intento_login ALTER COLUMN id_intento SET DEFAULT nextval('public.intento_login_id_intento_seq'::regclass);


--
-- Name: novedad_equipo id_novedad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.novedad_equipo ALTER COLUMN id_novedad SET DEFAULT nextval('public.novedad_equipo_id_novedad_seq'::regclass);


--
-- Name: programacion_recurso id_programacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programacion_recurso ALTER COLUMN id_programacion SET DEFAULT nextval('public.programacion_recurso_id_programacion_seq'::regclass);


--
-- Name: recurso id_recurso; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurso ALTER COLUMN id_recurso SET DEFAULT nextval('public.recurso_id_recurso_seq'::regclass);


--
-- Name: registro_acceso id_registro; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_acceso ALTER COLUMN id_registro SET DEFAULT nextval('public.registro_acceso_id_registro_seq'::regclass);


--
-- Name: registro_bitacora id_entrada; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_bitacora ALTER COLUMN id_entrada SET DEFAULT nextval('public.registro_bitacora_id_entrada_seq'::regclass);


--
-- Name: sesion_equipo id_sesion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_equipo ALTER COLUMN id_sesion SET DEFAULT nextval('public.sesion_equipo_id_sesion_seq'::regclass);


--
-- Name: turno id_turno; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turno ALTER COLUMN id_turno SET DEFAULT nextval('public.turno_id_turno_seq'::regclass);


--
-- Name: visitante id_visitante; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitante ALTER COLUMN id_visitante SET DEFAULT nextval('public.visitante_id_visitante_seq'::regclass);


--
-- Name: cambio_encargado_turno cambio_encargado_turno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambio_encargado_turno
    ADD CONSTRAINT cambio_encargado_turno_pkey PRIMARY KEY (id_cambio);


--
-- Name: configuracion_sistema configuracion_sistema_clave_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_clave_key UNIQUE (clave);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id_configuracion);


--
-- Name: dispositivo dispositivo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispositivo
    ADD CONSTRAINT dispositivo_pkey PRIMARY KEY (id_dispositivo);


--
-- Name: encargado encargado_codigo_identificacion_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT encargado_codigo_identificacion_key UNIQUE (codigo_identificacion);


--
-- Name: encargado encargado_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT encargado_pkey PRIMARY KEY (id_encargado);


--
-- Name: equipo equipo_numero_equipo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_numero_equipo_key UNIQUE (numero_equipo);


--
-- Name: equipo equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_pkey PRIMARY KEY (id_equipo);


--
-- Name: estudiante estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_pkey PRIMARY KEY (codigo_estudiantil);


--
-- Name: intento_login intento_login_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intento_login
    ADD CONSTRAINT intento_login_pkey PRIMARY KEY (id_intento);


--
-- Name: novedad_equipo novedad_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.novedad_equipo
    ADD CONSTRAINT novedad_equipo_pkey PRIMARY KEY (id_novedad);


--
-- Name: programacion_recurso programacion_recurso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programacion_recurso
    ADD CONSTRAINT programacion_recurso_pkey PRIMARY KEY (id_programacion);


--
-- Name: recurso recurso_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurso
    ADD CONSTRAINT recurso_nombre_key UNIQUE (nombre);


--
-- Name: recurso recurso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurso
    ADD CONSTRAINT recurso_pkey PRIMARY KEY (id_recurso);


--
-- Name: registro_acceso registro_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_acceso
    ADD CONSTRAINT registro_acceso_pkey PRIMARY KEY (id_registro);


--
-- Name: registro_bitacora registro_bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_bitacora
    ADD CONSTRAINT registro_bitacora_pkey PRIMARY KEY (id_entrada);


--
-- Name: sesion_equipo sesion_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_equipo
    ADD CONSTRAINT sesion_equipo_pkey PRIMARY KEY (id_sesion);


--
-- Name: turno turno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turno
    ADD CONSTRAINT turno_pkey PRIMARY KEY (id_turno);


--
-- Name: visitante visitante_codigo_temporal_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitante
    ADD CONSTRAINT visitante_codigo_temporal_key UNIQUE (codigo_temporal);


--
-- Name: visitante visitante_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitante
    ADD CONSTRAINT visitante_pkey PRIMARY KEY (id_visitante);


--
-- Name: registro_activo_unico; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX registro_activo_unico ON public.registro_acceso USING btree (codigo_estudiantil, id_turno) WHERE (((estado)::text = 'activo'::text) AND (codigo_estudiantil IS NOT NULL));


--
-- Name: sesion_activa_por_equipo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sesion_activa_por_equipo ON public.sesion_equipo USING btree (id_equipo) WHERE ((estado)::text = 'activa'::text);


--
-- Name: sesion_activa_por_registro; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sesion_activa_por_registro ON public.sesion_equipo USING btree (id_registro) WHERE ((estado)::text = 'activa'::text);


--
-- Name: turno_activo_unico; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX turno_activo_unico ON public.turno USING btree (estado) WHERE ((estado)::text = 'activo'::text);


--
-- Name: cambio_encargado_turno cambio_encargado_turno_id_encargado_entrante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambio_encargado_turno
    ADD CONSTRAINT cambio_encargado_turno_id_encargado_entrante_fkey FOREIGN KEY (id_encargado_entrante) REFERENCES public.encargado(id_encargado);


--
-- Name: cambio_encargado_turno cambio_encargado_turno_id_encargado_saliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambio_encargado_turno
    ADD CONSTRAINT cambio_encargado_turno_id_encargado_saliente_fkey FOREIGN KEY (id_encargado_saliente) REFERENCES public.encargado(id_encargado);


--
-- Name: cambio_encargado_turno cambio_encargado_turno_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambio_encargado_turno
    ADD CONSTRAINT cambio_encargado_turno_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turno(id_turno);


--
-- Name: configuracion_sistema configuracion_sistema_id_encargado_modifico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_id_encargado_modifico_fkey FOREIGN KEY (id_encargado_modifico) REFERENCES public.encargado(id_encargado);


--
-- Name: dispositivo dispositivo_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispositivo
    ADD CONSTRAINT dispositivo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id_equipo);


--
-- Name: novedad_equipo novedad_equipo_codigo_estudiantil_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.novedad_equipo
    ADD CONSTRAINT novedad_equipo_codigo_estudiantil_fkey FOREIGN KEY (codigo_estudiantil) REFERENCES public.estudiante(codigo_estudiantil);


--
-- Name: novedad_equipo novedad_equipo_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.novedad_equipo
    ADD CONSTRAINT novedad_equipo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id_equipo);


--
-- Name: novedad_equipo novedad_equipo_id_sesion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.novedad_equipo
    ADD CONSTRAINT novedad_equipo_id_sesion_fkey FOREIGN KEY (id_sesion) REFERENCES public.sesion_equipo(id_sesion);


--
-- Name: novedad_equipo novedad_equipo_id_visitante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.novedad_equipo
    ADD CONSTRAINT novedad_equipo_id_visitante_fkey FOREIGN KEY (id_visitante) REFERENCES public.visitante(id_visitante);


--
-- Name: programacion_recurso programacion_recurso_codigo_estudiantil_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programacion_recurso
    ADD CONSTRAINT programacion_recurso_codigo_estudiantil_fkey FOREIGN KEY (codigo_estudiantil) REFERENCES public.estudiante(codigo_estudiantil);


--
-- Name: programacion_recurso programacion_recurso_id_recurso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programacion_recurso
    ADD CONSTRAINT programacion_recurso_id_recurso_fkey FOREIGN KEY (id_recurso) REFERENCES public.recurso(id_recurso);


--
-- Name: programacion_recurso programacion_recurso_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programacion_recurso
    ADD CONSTRAINT programacion_recurso_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turno(id_turno);


--
-- Name: programacion_recurso programacion_recurso_id_visitante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programacion_recurso
    ADD CONSTRAINT programacion_recurso_id_visitante_fkey FOREIGN KEY (id_visitante) REFERENCES public.visitante(id_visitante);


--
-- Name: registro_acceso registro_acceso_codigo_estudiantil_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_acceso
    ADD CONSTRAINT registro_acceso_codigo_estudiantil_fkey FOREIGN KEY (codigo_estudiantil) REFERENCES public.estudiante(codigo_estudiantil);


--
-- Name: registro_acceso registro_acceso_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_acceso
    ADD CONSTRAINT registro_acceso_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


--
-- Name: registro_acceso registro_acceso_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_acceso
    ADD CONSTRAINT registro_acceso_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turno(id_turno);


--
-- Name: registro_acceso registro_acceso_id_visitante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_acceso
    ADD CONSTRAINT registro_acceso_id_visitante_fkey FOREIGN KEY (id_visitante) REFERENCES public.visitante(id_visitante);


--
-- Name: registro_bitacora registro_bitacora_id_encargado_edicion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_bitacora
    ADD CONSTRAINT registro_bitacora_id_encargado_edicion_fkey FOREIGN KEY (id_encargado_edicion) REFERENCES public.encargado(id_encargado);


--
-- Name: registro_bitacora registro_bitacora_id_encargado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_bitacora
    ADD CONSTRAINT registro_bitacora_id_encargado_fkey FOREIGN KEY (id_encargado) REFERENCES public.encargado(id_encargado);


--
-- Name: registro_bitacora registro_bitacora_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_bitacora
    ADD CONSTRAINT registro_bitacora_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turno(id_turno);


--
-- Name: sesion_equipo sesion_equipo_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_equipo
    ADD CONSTRAINT sesion_equipo_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


--
-- Name: sesion_equipo sesion_equipo_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_equipo
    ADD CONSTRAINT sesion_equipo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id_equipo);


--
-- Name: sesion_equipo sesion_equipo_id_registro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesion_equipo
    ADD CONSTRAINT sesion_equipo_id_registro_fkey FOREIGN KEY (id_registro) REFERENCES public.registro_acceso(id_registro);


--
-- Name: turno turno_id_encargado_apertura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turno
    ADD CONSTRAINT turno_id_encargado_apertura_fkey FOREIGN KEY (id_encargado_apertura) REFERENCES public.encargado(id_encargado);


--
-- Name: turno turno_id_encargado_cierre_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turno
    ADD CONSTRAINT turno_id_encargado_cierre_fkey FOREIGN KEY (id_encargado_cierre) REFERENCES public.encargado(id_encargado);


--
-- PostgreSQL database dump complete
--

