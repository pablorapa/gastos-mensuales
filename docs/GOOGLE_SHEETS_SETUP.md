# Configuración de Google Sheets

Esta guía detalla cómo configurar Google Sheets como base de datos para la aplicación.

## 📊 Estructura de las Hojas

El spreadsheet debe contener 4 hojas con las siguientes estructuras:

### 1. gastos_simples

Registra gastos de pago único.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | String | Identificador único (GS-timestamp) |
| Fecha | Date | Fecha del gasto (YYYY-MM-DD) |
| Concepto | String | Descripción del gasto |
| Monto | Number | Valor del gasto |
| Persona | String | 'Manuel' o 'Pablo' |
| CreatedAt | DateTime | Fecha de creación del registro |

**Ejemplo:**
```
GS-1710523456789 | 2024-03-15 | Supermercado | 150.50 | Manuel | 2024-03-15T10:30:00Z
```

---

### 2. gastos_cuotas

Registra gastos con cuotas mensuales.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | String | Identificador único (GC-timestamp) |
| Fecha | Date | Fecha de la compra |
| Concepto | String | Descripción de la compra |
| MontoTotal | Number | Valor total de la compra |
| CantidadCuotas | Number | Número de cuotas |
| MontoPorCuota | Number | Valor de cada cuota sin reintegro |
| MesInicio | String | Mes de la primera cuota (YYYY-MM) |
| Reintegro | Number | Monto a descontar progresivamente |
| Persona | String | 'Manuel' o 'Pablo' |
| CreatedAt | DateTime | Fecha de creación del registro |

**Ejemplo:**
```
GC-1710523456789 | 2024-03-15 | Notebook | 600 | 6 | 100 | 2024-03 | 180 | Pablo | 2024-03-15T10:30:00Z
```

---

### 3. cuotas_mensuales

Desglose mensual de cada cuota (generado automáticamente).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | String | Identificador (CM-gastoID-numeroCuota) |
| GastoID | String | ID del gasto padre |
| Concepto | String | Descripción de la compra |
| Mes | String | Mes de la cuota (YYYY-MM) |
| NumeroCuota | Number | Número de cuota (1, 2, 3...) |
| MontoCuota | Number | Monto efectivo a pagar (con reintegro) |
| MontoOriginal | Number | Monto original sin reintegro |
| ReintegroAplicado | Number | Reintegro descontado en esta cuota |
| Persona | String | 'Manuel' o 'Pablo' |
| CreatedAt | DateTime | Fecha de creación |

**Ejemplo (compra de $600 en 6 cuotas con reintegro de $180):**
```
CM-GC-123-1 | GC-123 | Notebook | 2024-03 | 1 | 0    | 100 | 100 | Pablo | 2024-03-15T10:30:00Z
CM-GC-123-2 | GC-123 | Notebook | 2024-04 | 2 | 20   | 100 | 80  | Pablo | 2024-03-15T10:30:00Z
CM-GC-123-3 | GC-123 | Notebook | 2024-05 | 3 | 100  | 100 | 0   | Pablo | 2024-03-15T10:30:00Z
CM-GC-123-4 | GC-123 | Notebook | 2024-06 | 4 | 100  | 100 | 0   | Pablo | 2024-03-15T10:30:00Z
CM-GC-123-5 | GC-123 | Notebook | 2024-07 | 5 | 100  | 100 | 0   | Pablo | 2024-03-15T10:30:00Z
CM-GC-123-6 | GC-123 | Notebook | 2024-08 | 6 | 100  | 100 | 0   | Pablo | 2024-03-15T10:30:00Z
```

---

### 4. balances

Balance mensual calculado automáticamente.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Mes | String | Mes del balance (YYYY-MM) |
| TotalManuel | Number | Total gastado por Manuel |
| TotalPablo | Number | Total gastado por Pablo |
| Diferencia | Number | TotalManuel - TotalPablo |
| Deudor | String | Quien debe compensar ('Manuel', 'Pablo' o '') |
| MontoACompensar | Number | Monto a transferir para equilibrar |
| GastosSimplesManuel | Number | Gastos simples de Manuel |
| GastosSimplesPablo | Number | Gastos simples de Pablo |
| GastosCuotasManuel | Number | Suma de cuotas de Manuel |
| GastosCuotasPablo | Number | Suma de cuotas de Pablo |
| UpdatedAt | DateTime | Última actualización |

**Ejemplo:**
```
2024-03 | 250 | 120 | 130 | Pablo | 65 | 150 | 100 | 100 | 20 | 2024-03-15T10:30:00Z
```

**Interpretación:**
- Manuel gastó $250 ($150 simples + $100 cuotas)
- Pablo gastó $120 ($100 simples + $20 cuotas)
- Pablo debe compensar $65 a Manuel

---

## 🔧 Inicialización Automática

Al llamar al endpoint `POST /api/init`, la aplicación:

1. Verifica qué hojas existen
2. Crea las hojas faltantes
3. Agrega los encabezados correspondientes

**No es necesario crear las hojas manualmente.**

---

## 📝 Fórmulas Útiles (Opcional)

Puedes agregar hojas adicionales con fórmulas para análisis:

### Hoja: Resumen

```excel
=QUERY(balances!A:K, "SELECT A, B, C, F WHERE A IS NOT NULL ORDER BY A DESC")
```

### Totales por Persona (todos los tiempos)

```excel
=SUMIF(gastos_simples!E:E, "Manuel", gastos_simples!D:D)
=SUMIF(gastos_simples!E:E, "Pablo", gastos_simples!D:D)
```

### Gráficos

Crea gráficos de barras con:
- Eje X: Mes (de balances!A:A)
- Serie 1: TotalManuel (balances!B:B)
- Serie 2: TotalPablo (balances!C:C)

---

## 🔐 Permisos

La service account necesita permisos de **Editor** en el spreadsheet:

1. Abre el spreadsheet
2. Clic en "Compartir"
3. Agrega el email de la service account:
   ```
   gastos-compartidos-api@tu-proyecto.iam.gserviceaccount.com
   ```
4. Rol: **Editor**
5. Desactiva "Notificar a las personas"

---

## 📊 Validación de Datos (Opcional)

Para mejorar la integridad, puedes agregar validaciones:

### En gastos_simples!E:E (Persona)
- Tipo: Lista de elementos
- Valores: `Manuel,Pablo`

### En gastos_cuotas!I:I (Persona)
- Tipo: Lista de elementos
- Valores: `Manuel,Pablo`

### En gastos_simples!D:D y gastos_cuotas!D:D (Monto)
- Tipo: Número
- Mayor o igual a: 0

---

## 🔍 Consultas Avanzadas

### Ver todos los gastos de Manuel en marzo 2024

```sql
=QUERY({gastos_simples!A:F; cuotas_mensuales!A:J}, 
       "SELECT * WHERE Col5='Manuel' AND Col2 CONTAINS '2024-03'")
```

### Top 5 gastos más altos

```sql
=QUERY(gastos_simples!A:F, 
       "SELECT * ORDER BY D DESC LIMIT 5")
```

---

## 📈 Backup

Google Sheets hace backup automático, pero puedes:

1. **Versiones**: Archivo → Ver historial de versiones
2. **Copias**: Archivo → Crear una copia
3. **Exportar**: Archivo → Descargar → Excel / CSV

---

## ⚠️ Límites de Google Sheets API

- **Lecturas**: 100 requests/100 segundos/usuario
- **Escrituras**: 100 requests/100 segundos/usuario
- **Tamaño**: 10 millones de celdas por spreadsheet

Para esta aplicación (2 usuarios), estos límites son más que suficientes.

---

## 🧪 Testing Manual

Para verificar que todo funciona:

1. Crea el spreadsheet
2. Comparte con la service account
3. Ejecuta: `POST /api/init`
4. Verifica que las 4 hojas se crearon con headers
5. Crea un gasto simple desde la app
6. Revisa que aparezca en `gastos_simples`
7. Crea un gasto en cuotas
8. Revisa que se generen las cuotas en `cuotas_mensuales`
9. Consulta el balance del mes
10. Revisa que se calcule en `balances`

---

## 🔧 Troubleshooting

### Error 403: Permission denied
- Verifica que compartiste el spreadsheet con la service account
- El rol debe ser "Editor", no "Viewer"

### Error 404: Spreadsheet not found
- Verifica el `GOOGLE_SPREADSHEET_ID` en `.env`
- Debe ser el ID de la URL, no el nombre

### Headers duplicados
- Si ves headers duplicados, elimina las hojas manualmente
- Vuelve a ejecutar `/api/init`

---

## 📚 Referencias

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets Formulas](https://support.google.com/docs/table/25273)
