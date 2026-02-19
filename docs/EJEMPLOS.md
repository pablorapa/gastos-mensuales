# Ejemplos de Uso

Esta guía muestra casos de uso comunes con ejemplos paso a paso.

## 📝 Caso 1: Gasto Simple del Supermercado

**Escenario:** Manuel fue al supermercado y pagó $150.

### Paso 1: Registrar el Gasto

1. Login en la aplicación
2. Clic en **"Agregar Gasto Simple"**
3. Completar formulario:
   - **Concepto**: Supermercado
   - **Monto**: 150
   - **Persona**: Manuel
   - **Fecha**: 2024-03-15
4. Clic en **"Guardar Gasto"**

### Resultado en Google Sheets

**Hoja: gastos_simples**
```
GS-1710523456789 | 2024-03-15 | Supermercado | 150 | Manuel | 2024-03-15T10:30:00Z
```

### Balance Actualizado

Si antes no había gastos:
- **Manuel**: $150
- **Pablo**: $0
- **Pablo debe compensar**: $75

---

## 💳 Caso 2: Compra en Cuotas sin Reintegro

**Escenario:** Pablo compró una heladera en 12 cuotas de $50 cada una, comenzando en marzo 2024.

### Paso 1: Registrar el Gasto

1. Clic en **"Agregar Gasto en Cuotas"**
2. Completar formulario:
   - **Concepto**: Heladera
   - **Monto Total**: 600
   - **Cantidad de Cuotas**: 12
   - **Monto por Cuota**: 50 (se calcula automáticamente)
   - **Reintegro**: (dejar vacío)
   - **Persona**: Pablo
   - **Mes de Inicio**: 2024-03
   - **Fecha**: 2024-03-01
3. Clic en **"Guardar Gasto en Cuotas"**

### Resultado en Google Sheets

**Hoja: gastos_cuotas**
```
GC-1710523456789 | 2024-03-01 | Heladera | 600 | 12 | 50 | 2024-03 | 0 | Pablo | 2024-03-01T10:00:00Z
```

**Hoja: cuotas_mensuales** (se generan 12 filas)
```
CM-GC-1710523456789-1  | GC-1710523456789 | Heladera | 2024-03 | 1  | 50 | 50 | 0 | Pablo | ...
CM-GC-1710523456789-2  | GC-1710523456789 | Heladera | 2024-04 | 2  | 50 | 50 | 0 | Pablo | ...
CM-GC-1710523456789-3  | GC-1710523456789 | Heladera | 2024-05 | 3  | 50 | 50 | 0 | Pablo | ...
...
CM-GC-1710523456789-12 | GC-1710523456789 | Heladera | 2025-02 | 12 | 50 | 50 | 0 | Pablo | ...
```

### Balance de Marzo 2024

- **Manuel**: $0 (simples) + $0 (cuotas) = $0
- **Pablo**: $0 (simples) + $50 (cuotas) = $50
- **Manuel debe compensar**: $25

---

## 🎁 Caso 3: Compra en Cuotas CON Reintegro

**Escenario:** Manuel compró una notebook de $600 en 6 cuotas de $100. El banco le devuelve $180 como cashback.

### Paso 1: Registrar el Gasto

1. Clic en **"Agregar Gasto en Cuotas"**
2. Completar formulario:
   - **Concepto**: Notebook
   - **Monto Total**: 600
   - **Cantidad de Cuotas**: 6
   - **Monto por Cuota**: 100
   - **Reintegro**: 180
   - **Persona**: Manuel
   - **Mes de Inicio**: 2024-03
   - **Fecha**: 2024-03-15
3. Clic en **"Guardar Gasto en Cuotas"**

### Resultado en Google Sheets

**Hoja: gastos_cuotas**
```
GC-1710523456790 | 2024-03-15 | Notebook | 600 | 6 | 100 | 2024-03 | 180 | Manuel | ...
```

**Hoja: cuotas_mensuales** (distribución del reintegro)
```
Mes       | Cuota | Monto Original | Reintegro | Monto Final
----------|-------|----------------|-----------|------------
2024-03   | 1     | 100            | 100       | 0
2024-04   | 2     | 100            | 80        | 20
2024-05   | 3     | 100            | 0         | 100
2024-06   | 4     | 100            | 0         | 100
2024-07   | 5     | 100            | 0         | 100
2024-08   | 6     | 100            | 0         | 100
```

**Explicación:**
- Cuota 1: $100 - $100 (reintegro) = $0 → Restante: $80
- Cuota 2: $100 - $80 (reintegro) = $20 → Restante: $0
- Cuotas 3-6: $100 - $0 = $100

**Costo real total**: $600 - $180 = $420

### Balance por Mes

**Marzo 2024:**
- Manuel: $0 (cuota 1 cubierta por reintegro)
- Cada uno paga: $0

**Abril 2024:**
- Manuel: $20 (cuota 2 con reintegro parcial)
- Cada uno paga: $10

**Mayo a Agosto 2024:**
- Manuel: $100 por mes
- Cada uno paga: $50 por mes

---

## 🏠 Caso 4: Mes con Múltiples Gastos

**Escenario:** En marzo 2024, ambos tuvieron gastos:

1. **Manuel**: Supermercado $150 (simple)
2. **Pablo**: Gimnasio $80 (simple)
3. **Manuel**: Streaming $20 (simple)
4. **Pablo**: Cuota 1 de heladera $50 (de caso anterior)
5. **Manuel**: Cuota 1 de notebook $0 (cubierta por reintegro)

### Balance de Marzo 2024

**Gastos Simples:**
- Manuel: $150 + $20 = $170
- Pablo: $80

**Gastos en Cuotas:**
- Manuel: $0 (notebook cuota 1)
- Pablo: $50 (heladera cuota 1)

**Totales:**
- Manuel: $170 + $0 = $170
- Pablo: $80 + $50 = $130

**Total del mes:** $300  
**Cada uno debe pagar:** $150

**Resultado:**
- Pablo debe compensar $20 a Manuel

---

## 🔄 Caso 5: Cambio de Mes

**Escenario:** Es abril 2024. Quiero ver los gastos de marzo.

### Paso 1: Cambiar Mes

1. En el dashboard, usa el selector de mes
2. Selecciona **"2024-03"**
3. O usa las flechas: **← Anterior**

### Resultado

- Se muestran **solo** los gastos simples de marzo
- Se muestran **solo** las cuotas que corresponden a marzo
- El balance se recalcula para ese mes

---

## 📊 Caso 6: Ver Balance Acumulado

**Escenario:** Quiero saber el total histórico.

### Opción 1: Desde Google Sheets

Abre el spreadsheet y crea una hoja "Resumen":

```excel
=SUMIF(gastos_simples!E:E, "Manuel", gastos_simples!D:D)
=SUMIF(gastos_simples!E:E, "Pablo", gastos_simples!D:D)

=SUMIF(cuotas_mensuales!I:I, "Manuel", cuotas_mensuales!F:F)
=SUMIF(cuotas_mensuales!I:I, "Pablo", cuotas_mensuales!F:F)
```

### Opción 2: Manualmente

Suma los balances mensuales:

```
Total Manuel = Σ(balance.totalManuel) para todos los meses
Total Pablo = Σ(balance.totalPablo) para todos los meses
```

---

## 🎯 Caso 7: Escenario Completo Real

**Situación:** Manuel y Pablo comparten un departamento. Marzo 2024.

### Gastos del Mes

1. **Alquiler** - Manuel pagó $800 (simple)
2. **Expensas** - Pablo pagó $200 (simple)
3. **Internet** - Manuel pagó $50 (simple)
4. **Supermercado #1** - Pablo pagó $120 (simple)
5. **Supermercado #2** - Manuel pagó $180 (simple)
6. **Netflix** - Pablo pagó $15 (simple)
7. **Heladera** - Pablo compró en 12 cuotas de $50, mes 1 (cuota)
8. **Notebook** - Manuel compró en 6 cuotas de $100 con $180 reintegro, mes 1 (cuota)

### Registrar Todo

#### Gastos Simples (7 registros)
```
Alquiler      | 800  | Manuel | 2024-03-01
Expensas      | 200  | Pablo  | 2024-03-05
Internet      | 50   | Manuel | 2024-03-10
Supermercado  | 120  | Pablo  | 2024-03-12
Supermercado  | 180  | Manuel | 2024-03-20
Netflix       | 15   | Pablo  | 2024-03-25
```

#### Gastos en Cuotas (2 registros)
```
Heladera | 600 | 12 | 50  | 2024-03 | 0   | Pablo
Notebook | 600 | 6  | 100 | 2024-03 | 180 | Manuel
```

### Balance Calculado

**Gastos Simples:**
- Manuel: $800 + $50 + $180 = $1,030
- Pablo: $200 + $120 + $15 = $335

**Cuotas del Mes:**
- Manuel: $0 (notebook cuota 1 cubierta)
- Pablo: $50 (heladera cuota 1)

**Totales:**
- Manuel: $1,030
- Pablo: $385

**Total del mes:** $1,415  
**Cada uno debe:** $707.50

**Resultado Final:**
- **Pablo debe compensar $322.50 a Manuel**

### ¿Cómo Compensar?

Pablo realiza una transferencia de $322.50 a Manuel. Opcional: registrarlo como:

```
Concepto: Compensación marzo
Monto: -322.50 (negativo)
Persona: Pablo
```

O simplemente anotarlo en un cuaderno/hoja extra.

---

## 🧪 Caso 8: Probar la Aplicación (Testing)

### Test 1: Gasto Simple Básico

1. Crear gasto: `Test | 100 | Manuel | Hoy`
2. Ver que aparezca en el dashboard
3. Verificar balance: Manuel $100, Pablo $0
4. Abrir Google Sheets y verificar fila en `gastos_simples`

### Test 2: Gasto en Cuotas Básico

1. Crear gasto en cuotas: `Test Cuotas | 300 | 3 | 100 | Mes actual | Manuel`
2. Ver que aparezca en el dashboard
3. Verificar que se crearon 3 filas en `cuotas_mensuales`
4. Cambiar al siguiente mes y verificar que aparezca la cuota 2

### Test 3: Reintegro

1. Crear gasto: `Test Reintegro | 200 | 2 | 100 | Reintegro: 120 | Mes actual | Pablo`
2. Ver que cuota 1 = $0
3. Ver que cuota 2 = $80
4. Verificar en Google Sheets columna "ReintegroAplicado"

---

## 💡 Tips y Mejores Prácticas

### ✅ DO

- Registrar gastos apenas sucedan (no esperar al fin de mes)
- Usar conceptos descriptivos: "Supermercado Carrefour" mejor que "Compra"
- Incluir reintegros cuando corresponda
- Verificar el balance mensualmente

### ❌ DON'T

- No editar directamente Google Sheets (usar la app)
- No borrar las hojas creadas automáticamente
- No compartir el spreadsheet públicamente
- No usar montos negativos para compensaciones (mejor hacerlo aparte)

---

## 📱 Uso Mobile

### Instalar PWA en Android

1. Abre la app en Chrome
2. Menu (⋮) → "Instalar aplicación"
3. Acepta la instalación
4. Icono aparece en home screen

### Instalar PWA en iOS

1. Abre la app en Safari
2. Botón "Compartir" (□↑)
3. "Agregar a pantalla de inicio"
4. Icono aparece en home screen

### Uso Offline

La PWA cachea:
- UI y estilos
- Última sesión
- JavaScript

**No funciona offline:**
- Crear gastos (requiere API)
- Ver balances actualizados

---

## 🔍 Auditoría y Reportes

### Reporte Mensual

Desde Google Sheets, crea una hoja "Reporte Marzo":

```excel
=QUERY(gastos_simples!A:F, "SELECT B, C, D, E WHERE B CONTAINS '2024-03' ORDER BY B")
=QUERY(cuotas_mensuales!A:J, "SELECT D, C, F, I WHERE D = '2024-03' ORDER BY I")
```

### Gráfico de Gastos

1. Selecciona columnas de `balances`: Mes, TotalManuel, TotalPablo
2. Insertar → Gráfico → Columnas
3. Personaliza colores y título

---

**¡Estos ejemplos cubren el 90% de los casos de uso! 🎉**
