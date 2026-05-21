# API — Microservicio Commerce

**Base URL:** `http://localhost:3001`

> El puerto se define en la variable de entorno `PORT` del archivo `.env`. Por defecto es `3001`.

---

## Endpoints

| Método | Ruta                       | Descripción                                |
| ------ | -------------------------- | ------------------------------------------ |
| `GET`  | `/`                        | Health check del servicio                  |
| `POST` | `/commerce/upload`         | Subir archivo CSV y registrar en commerce  |
| `POST` | `/commerce/validate`       | Validar registros por fecha de proceso     |
| `GET`  | `/commerce/quarantine`     | Listar registros en commerce_quarantine    |

---

## 1. Health Check

### `GET /`

```
GET http://localhost:3001/
```

**Respuesta:**
```
Hello World!
```

---

## 2. Subir archivo CSV

Registra los datos del CSV en la tabla `commerce` mediante el store procedure `sp_create_commerce`.

### `POST /commerce/upload`

**Content-Type:** `multipart/form-data`

| Campo  | Tipo | Descripción                                                         |
| ------ | ---- | ------------------------------------------------------------------- |
| `file` | File | Archivo CSV. Solo extensión `.csv`. Nombre sugerido: `commerce_DDMMYYYY.csv` |

### Validaciones

- El archivo **no debe estar vacío** → `400 Bad Request`
- Solo archivos con extensión `.csv`
- El CSV debe tener encabezados (primera fila con nombres de columna)

### Estructura del CSV

```
pc_nomcomred,pc_numdoc,pc_processdate,categoria,marca,precio,stock,fecha_vencimiento
```

| Columna           | Tipo   | Descripción                           |
| ----------------- | ------ | ------------------------------------- |
| `pc_nomcomred`    | String | Nombre del comercio                   |
| `pc_numdoc`       | String | Número de documento del comercio      |
| `pc_processdate`  | String | Fecha de proceso (`YYYY-MM-DD`)       |
| `categoria`       | String | Categoría del producto                |
| `marca`           | String | Marca del producto                    |
| `precio`          | Number | Precio del producto                   |
| `stock`           | Number | Cantidad en stock                     |
| `fecha_vencimiento` | String | Fecha de vencimiento (`YYYY-MM-DD` o `N/A`) |

### Ejemplo con fetch

```javascript
const input = document.getElementById('csvFile'); // <input type="file" accept=".csv">
const formData = new FormData();
formData.append('file', input.files[0]);

const res = await fetch('http://localhost:3001/commerce/upload', {
  method: 'POST',
  body: formData,
});

const data = await res.json();
console.log(data); // { message: "CSV processed successfully" }
```

### Ejemplo con axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', file);

const res = await axios.post('http://localhost:3001/commerce/upload', formData);
console.log(res.data); // { message: "CSV processed successfully" }
```

### Respuestas

| Código | Body                                                              |
| ------ | ----------------------------------------------------------------- |
| `201`  | `{ "message": "CSV processed successfully" }`                     |
| `400`  | `{ "message": "File is empty", "error": "Bad Request", ... }`     |
| `400`  | `{ "message": "Only CSV files are allowed", "error": "Bad Request", ... }` |
| `400`  | `{ "message": "No file uploaded", "error": "Bad Request", ... }`  |

---

## 3. Validar registros por fecha de proceso

Ejecuta el store procedure `sp_validate_commerce` que:

1. Verifica que `pc_nomcomred` **no esté vacío**
2. Verifica que `pc_numdoc` **no esté vacío** y **solo contenga dígitos** (sin letras ni caracteres especiales)
3. Los registros que **no cumplan** se eliminan de `commerce` y se insertan en `commerce_quarantine` con el motivo del rechazo en la columna `motivo`
4. Los registros **válidos** permanecen en `commerce`

### `POST /commerce/validate`

**Content-Type:** `application/json`

| Campo           | Tipo   | Descripción                          |
| --------------- | ------ | ------------------------------------ |
| `pcProcessdate` | String | Fecha de proceso. Formato: `YYYY-MM-DD` |

### Ejemplo con fetch

```javascript
const res = await fetch('http://localhost:3001/commerce/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pcProcessdate: '2025-03-15' }),
});

const data = await res.json();
console.log(data); // { insertedInQuarantine: 4 }
```

### Ejemplo con axios

```javascript
const res = await axios.post('http://localhost:3001/commerce/validate', {
  pcProcessdate: '2025-03-15',
});
console.log(res.data); // { insertedInQuarantine: 4 }
```

### Respuestas

| Código | Body                                                                    |
| ------ | ----------------------------------------------------------------------- |
| `201`  | `{ "insertedInQuarantine": <número_de_registros_movidos> }`              |
| `400`  | `{ "message": "pcProcessdate is required", "error": "Bad Request", ... }` |

### Interpretación

- `insertedInQuarantine: 0` → todos los registros con esa fecha son válidos
- `insertedInQuarantine: N` → `N` registros fueron movidos a `commerce_quarantine`

### Motivos de rechazo (columna `motivo`)

| Motivo                                               | Condición                                |
| ---------------------------------------------------- | ---------------------------------------- |
| `pc_nomcomred vacio`                                 | `pc_nomcomred` es `NULL` o cadena vacía  |
| `pc_numdoc vacio`                                    | `pc_numdoc` es `NULL` o cadena vacía     |
| `pc_numdoc contiene letras o caracteres especiales`  | `pc_numdoc` tiene caracteres no numéricos |

Pueden combinarse: `"pc_nomcomred vacio; pc_numdoc contiene letras o caracteres especiales; "`

---

## 4. Listar registros en cuarentena

### `GET /commerce/quarantine`

```
GET http://localhost:3001/commerce/quarantine
```

### Ejemplo con fetch

```javascript
const res = await fetch('http://localhost:3001/commerce/quarantine');
const data = await res.json();
console.log(data);
```

### Ejemplo con axios

```javascript
const res = await axios.get('http://localhost:3001/commerce/quarantine');
console.log(res.data);
```

### Respuesta

```json
[
  {
    "id": 1,
    "pcNomcomred": null,
    "pcNumdoc": "77889900",
    "pcProcessdate": "2025-03-15",
    "categoria": "Antiinflamatorio",
    "marca": "Voltaren",
    "precio": "11.75",
    "stock": 110,
    "fechaVencimiento": "2025-07-22",
    "motivo": "pc_nomcomred vacio; "
  },
  {
    "id": 2,
    "pcNomcomred": "Farmacia San Isidro",
    "pcNumdoc": "abc12345",
    "pcProcessdate": "2025-03-15",
    "categoria": "Antihipertensivo",
    "marca": "Genérico",
    "precio": "14.20",
    "stock": 75,
    "fechaVencimiento": "2025-12-12",
    "motivo": "pc_numdoc contiene letras o caracteres especiales; "
  }
]
```

Si no hay registros: `[]`

---

## Archivo CSV de ejemplo

El proyecto incluye `farmacia-example.csv` con 20 registros. Contiene datos inválidos para probar el flujo completo:

| Fila | pc_nomcomred          | pc_numdoc  | Inválido | Motivo                                    |
| ---- | --------------------- | ---------- | -------- | ----------------------------------------- |
| 9    | *(vacío)*             | 77889900   | Sí       | pc_nomcomred vacio                        |
| 10   | Farmacia San Isidro   | abc12345   | Sí       | pc_numdoc contiene letras                 |
| 13   | *(vacío)*             | 11335577   | Sí       | pc_nomcomred vacio                        |
| 14   | Farmacia Pueblo Libre | abcd!xyz   | Sí       | pc_numdoc contiene letras o carácteres especiales |

### Cómo probar el flujo completo

```bash
# 1. Copiar el CSV de ejemplo con el formato esperado
cp farmacia-example.csv uploads/commerce_20032025.csv

# 2. Subir el archivo
curl -X POST http://localhost:3001/commerce/upload \
  -F "file=@uploads/commerce_20032025.csv"

# 3. Validar registros con fecha de proceso
curl -X POST http://localhost:3001/commerce/validate \
  -H "Content-Type: application/json" \
  -d '{"pcProcessdate":"2025-03-15"}'

# 4. Listar los registros en cuarentena
curl http://localhost:3001/commerce/quarantine
```

---

## Flujo recomendado para el frontend

```
[Seleccionar CSV] → [POST /commerce/upload] → [Ingresar fecha] → [POST /commerce/validate] → [Mostrar resultado + GET /commerce/quarantine]
```

### Componente React de ejemplo

```tsx
import { useState } from 'react';

const API = 'http://localhost:3001';

function CommerceApp() {
  const [file, setFile] = useState<File | null>(null);
  const [processDate, setProcessDate] = useState('');
  const [quarantine, setQuarantine] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/commerce/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    setMessage(JSON.stringify(data));
  };

  const handleValidate = async () => {
    const res = await fetch(`${API}/commerce/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pcProcessdate: processDate }),
    });
    const data = await res.json();
    setMessage(JSON.stringify(data));
  };

  const handleListQuarantine = async () => {
    const res = await fetch(`${API}/commerce/quarantine`);
    const data = await res.json();
    setQuarantine(data);
  };

  return (
    <div>
      <h1>Commerce CSV</h1>
      <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload}>Subir CSV</button>

      <hr />
      <input type="date" value={processDate} onChange={e => setProcessDate(e.target.value)} />
      <button onClick={handleValidate}>Validar</button>

      <hr />
      <button onClick={handleListQuarantine}>Ver cuarentena</button>

      <pre>{message}</pre>
      <pre>{JSON.stringify(quarantine, null, 2)}</pre>
    </div>
  );
}
```
