
drop database if exists banco_kinal;
create database banco_kinal character set utf8mb4 collate utf8mb4_unicode_ci;
use banco_kinal;
set names utf8mb4;

-- ---------- tipocuenta ----------
create table tipo_cuenta (
  id_tipo_cuenta int auto_increment primary key,
  nombre         varchar(30)  not null unique,
  descripcion    varchar(120) null
) engine=innodb;

-- ---------- cliente ----------
create table cliente (
  id_cliente     int auto_increment primary key,
  documento      varchar(20)  not null unique,   -- número ficticio
  nombres        varchar(60)  not null,
  apellidos      varchar(60)  not null,
  correo         varchar(100) null,
  telefono       varchar(15)  null,
  direccion      varchar(150) null,
  estado         enum('activo','inactivo') not null default 'activo',
  fecha_registro datetime not null default current_timestamp
) engine=innodb;

-- ---------- usuario (personal del sistema) ----------
create table usuario (
  id_usuario    int auto_increment primary key,
  username      varchar(30)  not null unique,
  password_hash varchar(100) not null,            -- bcrypt, nunca texto plano
  nombre        varchar(80)  not null,
  rol           enum('admin','cajero') not null default 'cajero',
  estado        enum('activo','inactivo') not null default 'activo'
) engine=innodb;

-- ---------- cuenta ----------
create table cuenta (
  id_cuenta      int auto_increment primary key,
  numero_cuenta  varchar(12)   not null unique,
  id_cliente     int           not null,           -- rn01: pertenece a un cliente
  id_tipo_cuenta int           not null,
  saldo          decimal(12,2) not null default 0.00,
  estado         enum('activa','inactiva') not null default 'activa',
  fecha_creacion datetime      not null default current_timestamp,
  constraint fk_cuenta_cliente foreign key (id_cliente)
    references cliente(id_cliente),
  constraint fk_cuenta_tipo foreign key (id_tipo_cuenta)
    references tipo_cuenta(id_tipo_cuenta),
  constraint chk_saldo_no_negativo check (saldo >= 0)
) engine=innodb;

-- ---------- transferencia ----------
create table transferencia (
  id_transferencia  int auto_increment primary key,
  id_cuenta_origen  int           not null,
  id_cuenta_destino int           not null,
  monto             decimal(12,2) not null,
  fecha             datetime      not null default current_timestamp,
  id_usuario        int           not null,
  constraint fk_trf_origen  foreign key (id_cuenta_origen)  references cuenta(id_cuenta),
  constraint fk_trf_destino foreign key (id_cuenta_destino) references cuenta(id_cuenta),
  constraint fk_trf_usuario foreign key (id_usuario)        references usuario(id_usuario),
  constraint chk_trf_monto  check (monto > 0),
  constraint chk_trf_distintas check (id_cuenta_origen <> id_cuenta_destino) -- rn07
) engine=innodb;

-- ---------- movimiento (rn08: registro de toda operación) ----------
create table movimiento (
  id_movimiento    int auto_increment primary key,
  id_cuenta        int           not null,
  tipo             enum('deposito','retiro','transferencia_enviada','transferencia_recibida') not null,
  monto            decimal(12,2) not null,
  saldo_resultante decimal(12,2) not null,
  fecha            datetime      not null default current_timestamp,
  id_usuario       int           not null,
  id_transferencia int           null,              -- enlaza las dos cuentas de una transferencia
  descripcion      varchar(150)  null,wddw
  constraint fk_mov_cuenta  foreign key (id_cuenta)        references cuenta(id_cuenta),
  constraint fk_mov_usuario foreign key (id_usuario)       references usuario(id_usuario),