# Cómo Actualizar el Horario Semanal

Este documento explica cómo actualizar el horario semanal de los empleados en el sistema de gestión de tareas.

## Ubicación del Archivo

El horario se encuentra en:
```
src/lib/scheduleData.ts
```

## Pasos para Actualizar

### 1. Obtener la Nueva Imagen del Horario

Cada semana, guarda la nueva imagen del horario en la carpeta del proyecto para referencia.

### 2. Abrir el Archivo scheduleData.ts

Abre el archivo `src/lib/scheduleData.ts` en tu editor de código.

### 3. Actualizar el Objeto WEEKLY_SCHEDULE

Busca el objeto `WEEKLY_SCHEDULE` y actualiza los turnos según la columna **"Recepción"** de la imagen del horario.

**Reglas de interpretación:**

- **Lunes a Viernes:**
  - Si el empleado aparece en la parte **superior** (antes de ~13:30): `'morning'`
  - Si el empleado aparece en la parte **inferior** (después de ~13:30): `'afternoon'`
  
- **Sábado y Domingo:**
  - Si el empleado trabaja: `'full-day'`
  
- **No trabaja:** `null`

### 4. Ejemplo de Actualización

```typescript
export const WEEKLY_SCHEDULE: WeeklySchedule = {
  'javivasco': {
    'monday': 'morning',      // Javi Vasco trabaja lunes por la mañana
    'tuesday': null,          // No trabaja martes
    'wednesday': 'morning',   // Trabaja miércoles por la mañana
    'thursday': null,         // No trabaja jueves
    'friday': null,           // No trabaja viernes
    'saturday': null,         // No trabaja sábado
    'sunday': null,           // No trabaja domingo
  },
  'ivan': {
    'monday': 'afternoon',    // Ivan trabaja lunes por la tarde
    'tuesday': 'morning',     // Trabaja martes por la mañana
    // ... continuar para cada día
  },
  // ... continuar para andres y cristina
};
```

### 5. Guardar y Verificar

1. **Guarda el archivo** `scheduleData.ts`
2. El servidor de desarrollo (`npm run dev`) recargará automáticamente
3. **Verifica** iniciando sesión con cada usuario y comprobando que:
   - Los días que trabajan muestran las tareas correctas
   - Los días que no trabajan muestran "Hoy no trabajas"

## Usuarios del Sistema

Los 4 usuarios con acceso son:

| Usuario | Contraseña | Nombre Completo |
|---------|-----------|-----------------|
| `javivasco` | `javivasco` | Javi Vasco |
| `ivan` | `ivan` | Ivan |
| `andres` | `andres` | Andres |
| `cristina` | `cristina` | Cristina |
| `Aisha` | `aisha` | Aisha |

## Días de la Semana

Los días se escriben en inglés y en minúsculas:
- `'monday'` - Lunes
- `'tuesday'` - Martes
- `'wednesday'` - Miércoles
- `'thursday'` - Jueves
- `'friday'` - Viernes
- `'saturday'` - Sábado
- `'sunday'` - Domingo

## Tipos de Turno

- `'morning'` - Turno de Mañana
- `'afternoon'` - Turno de Tarde
- `'full-day'` - Día Completo (sábados/domingos)
- `null` - No trabaja ese día

## Imagen de Referencia Actual

La última imagen del horario procesada se encuentra en:
```
/Users/jvascpin/.gemini/antigravity/brain/e6462122-7558-4518-831b-e52fb1b0aca6/uploaded_image_1764874747199.png
```

![Horario Actual](/Users/jvascpin/.gemini/antigravity/brain/e6462122-7558-4518-831b-e52fb1b0aca6/uploaded_image_1764874747199.png)

## Mejora Futura: OCR Automático

En el futuro, se podría implementar un sistema de OCR (reconocimiento óptico de caracteres) para extraer automáticamente los datos del horario desde la imagen. Por ahora, la actualización manual es rápida y fiable.
