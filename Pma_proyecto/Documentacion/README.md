# Sistema Bancario Académico

Proyecto Integrador — Taller 2 — Fundación Kinal
**Grado y sección:** 5to Perito en Programación y Tecnología, sección ____
**Docente:** ____ | **Integrantes:** ____ | **Inicio:** ____ | **Entrega:** ____

> Sistema exclusivamente educativo. Todos los datos, cuentas y credenciales son **ficticios**.

## Descripción
Sistema bancario en tres capas (frontend, backend y base de datos) para gestionar clientes, cuentas y operaciones simuladas: depósitos, retiros, transferencias, movimientos y reportes, con validaciones y reglas de negocio.

## Objetivos
- Implementar CRUD de clientes y cuentas.
- Implementar depósitos, retiros y transferencias con validaciones.
- Registrar cada operación con fecha, tipo, monto y cuentas involucradas.
- Autenticación con credenciales ficticias.
- Probar la API con Postman y usar Git/GitHub con commits frecuentes.

## Tecnologías
| Capa | Tecnología |
|---|---|
| Frontend | Angular + TypeScript |
| Backend | Node.js + TypeScript / API REST |
| Base de datos | MySQL 8.0.16+ |
| Pruebas | Postman |
| Versiones | Git + GitHub |

## Estructura
```
sistema-bancario/
|-- frontend/   Angular
|-- backend/    API REST
|-- database/   banco_script.sql, ERD
|-- docs/       documentación y diagramas
|-- postman/    colección de pruebas
`-- README.md
```

## Instalación
```bash
git clone <URL_DEL_REPOSITORIO> && cd sistema-bancario
mysql -u root -p < database/banco_script.sql

cd backend && npm install && cp .env.example .env   # completar datos
npm run dev

cd ../frontend && npm install && ng serve            # http://localhost:4200
```
Variables de `.env` (ejemplo): `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=banco_kinal`, `JWT_SECRET`.
> Ajustar los comandos a los scripts reales del `package.json`.

## Credenciales ficticias
| Usuario | Contraseña | Rol |
|---|---|---|
| admin | Admin123! | ADMIN |
| cajero1 | Cajero123! | CAJERO |

Cuentas de prueba: `100000000001` (1000.00), `100000000002` (2500.00), `100000000003` (INACTIVA, para P010).

## Endpoints (prefijo `/api`, requieren `Authorization: Bearer <token>` salvo login)
| Recurso | Método y ruta |
|---|---|
| Autenticación | `POST /auth/login` |
| Clientes | `GET /clientes`, `GET /clientes/:id`, `POST /clientes`, `PUT /clientes/:id`, `PATCH /clientes/:id/desactivar` |
| Cuentas | `GET /cuentas`, `GET /cuentas/:id`, `POST /cuentas`, `PUT /cuentas/:id` |
| Depósitos | `POST /depositos` |
| Retiros | `POST /retiros` |
| Transferencias | `POST /transferencias` |
| Movimientos | `GET /movimientos`, `GET /movimientos/cuenta/:id`, `POST /movimientos` |
| Reportes | `GET /reportes/resumen` |

Códigos: 200, 201, 400 (datos inválidos), 401 (no autorizado), 404, 409 (cuenta inactiva / saldo insuficiente).

## Reglas de negocio
1. Una cuenta pertenece a un cliente. 2. No se retira más que el saldo. 3. Depósitos mayores que cero. 4. Retiros mayores que cero. 5. Transferencia con cuentas origen y destino válidas. 6. La cuenta origen debe tener saldo suficiente. 7. No se transfiere a la misma cuenta. 8. Toda operación se registra. 9. Una cuenta inactiva no opera. 10. Solo información ficticia.

## Pruebas obligatorias
P001 Login válido · P002 Login inválido · P003 Registrar cliente · P004 Crear cuenta · P005 Depósito válido · P006 Retiro con saldo suficiente · P007 Retiro superior al saldo · P008 Transferencia válida · P009 Transferencia a misma cuenta · P010 Cuenta inactiva.
Resultados y evidencias: ver la matriz de pruebas en `docs/Documentacion_Sistema_Bancario.pdf`.

## Documentación
Requerimientos, historias de usuario, diagramas, arquitectura, modelo de datos, matriz de pruebas, registro de errores, manual de usuario y registro de uso de IA están en `docs/Documentacion_Sistema_Bancario.pdf`. Diagramas individuales en `docs/diagramas/`.

## Uso de IA
Se usó Claude como apoyo para documentación y diseño. El detalle (prompt, resultado, aplicación, modificación y comprensión) está en la sección 14 de la documentación.
