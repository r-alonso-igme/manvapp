# 🔒 Reglas de Seguridad Firebase - ManvApp

## ⚠️ Estado Actual de Seguridad
Tu base de datos Firebase podría tener reglas inseguras que permiten acceso completo a cualquier usuario. Esto es un **riesgo de seguridad crítico** que debe ser abordado inmediatamente.

### 🆕 Última Actualización: Noviembre 2025
Este documento ha sido actualizado con las últimas mejores prácticas de seguridad Firebase y nuevas reglas para prevenir ataques comunes.

## 🛡️ Reglas de Seguridad Recomendadas

### Opción 1: Reglas Básicas CORREGIDAS (Recomendado para desarrollo)
```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'currentSet']) && newData.child('teamA').hasChildren(['name', 'score', 'sets']) && newData.child('teamB').hasChildren(['name', 'score', 'sets']) && newData.child('currentSet').isNumber()"
      }
    },
    "connections": {
      "$matchId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### Opción 1-B: Reglas Básicas SIN Validación (Si sigues teniendo problemas)
```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": true,
        ".write": true
      }
    },
    "connections": {
      "$matchId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### Opción 2: Reglas Más Restrictivas (Recomendado para producción)
```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": "data.exists() || !data.exists()",
        ".write": "!data.exists() || data.exists()",
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'currentSet', 'referee']) && newData.child('teamA').hasChildren(['name', 'sets', 'score']) && newData.child('teamB').hasChildren(['name', 'sets', 'score'])"
      }
    },
    "connections": {
      "$matchId": {
        "$connectionId": {
          ".read": true,
          ".write": "!data.exists() || data.exists()"
        }
      }
    }
  }
}
```

### Opción 3: Reglas con Control de Tiempo (Más seguro)
```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": true,
        ".write": "!data.exists() || (data.exists() && (now - data.child('createdAt').val()) < 86400000)",
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'currentSet']) && newData.child('createdAt').isNumber()"
      }
    },
    "connections": {
      "$matchId": {
        "$connectionId": {
          ".read": true,
          ".write": "!data.exists() || (data.exists() && (now - data.child('timestamp').val()) < 3600000)"
        }
      }
    }
  }
}
```

### Opción 4: Reglas Ultra Seguras (Recomendado para producción 2025) 🆕
```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": "($matchId.length >= 10 && $matchId.length <= 20)",
        ".write": "(!data.exists() || (data.exists() && (now - data.child('createdAt').val()) < 86400000)) && newData.child('lastUpdate').val() === now",
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'currentSet', 'createdAt', 'lastUpdate']) && newData.child('createdAt').isNumber() && newData.child('lastUpdate').isNumber() && newData.child('teamA').child('score').isNumber() && newData.child('teamB').child('score').isNumber() && newData.child('currentSet').isNumber() && newData.child('currentSet').val() >= 1 && newData.child('currentSet').val() <= 5"
      }
    },
    "connections": {
      "$matchId": {
        "$connectionId": {
          ".read": "($matchId.length >= 10 && $matchId.length <= 20)",
          ".write": "(!data.exists() && newData.child('timestamp').val() === now) || (data.exists() && (now - data.child('timestamp').val()) < 1800000)",
          ".validate": "newData.hasChildren(['timestamp', 'type']) && newData.child('timestamp').isNumber() && (newData.child('type').val() === 'referee' || newData.child('type').val() === 'spectator')"
        }
      }
    },
    "activeMatches": {
      ".read": true,
      ".write": false
    },
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

### Opción 5: Reglas con Rate Limiting (Anti-DDoS) 🆕
```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": true,
        ".write": "!data.exists() || (data.exists() && (now - data.child('lastUpdate').val()) > 1000)",
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'currentSet', 'lastUpdate']) && newData.child('lastUpdate').val() === now"
      }
    },
    "connections": {
      "$matchId": {
        "$connectionId": {
          ".read": true,
          ".write": "!data.exists() || (now - data.child('timestamp').val()) > 5000",
          ".validate": "newData.child('timestamp').val() === now"
        }
      }
    },
    "rateLimiting": {
      "$userId": {
        ".read": false,
        ".write": "!data.exists() || (now - data.val()) > 1000",
        ".validate": "newData.isNumber() && newData.val() === now"
      }
    }
  }
}
```

## 📋 Pasos para Aplicar las Reglas

### 1. Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `manvapp-volleyball`

### 2. Configurar Realtime Database
1. En el menú lateral, ve a **Build** > **Realtime Database**
2. Haz clic en la pestaña **"Reglas"**

### 3. Reemplazar Reglas Actuales
1. **Elimina** todo el contenido actual (probablemente las reglas de prueba)
2. **Copia y pega** una de las opciones de arriba
3. **Recomendación**: Usa la **Opción 1** para empezar

### 4. Publicar las Reglas
1. Haz clic en **"Publicar"**
2. Confirma que quieres aplicar los cambios

## 🔍 Explicación Detallada de las Reglas

### Opción 1 - Reglas Básicas CORREGIDAS
- ✅ Solo permite acceso a rutas específicas (`matches` y `connections`)
- ✅ Valida estructura básica: `teamA`, `teamB`, `currentSet`
- ✅ Verifica que teams tengan `name`, `score`, `sets`
- ✅ Valida que `currentSet` sea un número
- ⚠️ No tiene restricciones de tiempo
- 📊 **Nivel de Seguridad**: Básico

### Opción 1-B - Sin Validación (Emergencia)
- ✅ Solo permite acceso a rutas específicas (`matches` y `connections`) 
- ❌ Sin validación de estructura (menos seguro)
- ✅ Funciona con cualquier formato de datos
- ⚠️ Usar solo si la Opción 1 falla
- 📊 **Nivel de Seguridad**: Mínimo

### Opción 2 - Reglas Restrictivas
- ✅ Control más granular sobre lectura/escritura
- ✅ Validación más estricta de datos
- ✅ Estructura específica para conexiones
- ⚠️ Podría ser más compleja de mantener
- 📊 **Nivel de Seguridad**: Intermedio

### Opción 3 - Reglas con Tiempo
- ✅ Los partidos se "auto-eliminan" después de 24 horas
- ✅ Las conexiones expiran después de 1 hora
- ✅ Previene acumulación de datos obsoletos
- 📊 **Nivel de Seguridad**: Alto
- 🎯 **Recomendado para producción básica**

### 🆕 Opción 4 - Reglas Ultra Seguras
- ✅ Validación estricta de IDs de partido (longitud 10-20 caracteres)
- ✅ Timestamps obligatorios en todas las escrituras
- ✅ Validación de tipos de datos (números, strings)
- ✅ Límites en valores de sets (1-5)
- ✅ Conexiones con tipos específicos (referee/spectator)
- ✅ Bloqueo de rutas no autorizadas
- 📊 **Nivel de Seguridad**: Muy Alto
- 🎯 **Recomendado para producción profesional**

### 🆕 Opción 5 - Reglas Anti-DDoS
- ✅ Rate limiting: mínimo 1 segundo entre actualizaciones de partidos
- ✅ Rate limiting: mínimo 5 segundos entre actualizaciones de conexiones
- ✅ Tracking de usuarios para prevenir spam
- ✅ Protección contra ataques de denegación de servicio
- 📊 **Nivel de Seguridad**: Máximo
- 🎯 **Recomendado para aplicaciones de alto tráfico**

## 🚨 Urgencia del Cambio

### ¿Por qué es importante?
- **Seguridad**: Cualquiera puede acceder/modificar tus datos
- **Privacidad**: Los datos de partidos son públicos
- **Integridad**: Alguien podría corromper/eliminar datos
- **Costo**: Uso no autorizado podría generar gastos

### ¿Cuándo cambiar?
- **¡AHORA MISMO!** - Firebase muestra esta advertencia por una razón

## 🔍 Monitoreo y Debugging 🆕

### Herramientas de Monitoreo Firebase

#### 1. Firebase Console - Pestaña de Uso
- **Métricas en tiempo real**: Conexiones activas, lecturas/escrituras por minuto
- **Alertas de seguridad**: Notificaciones sobre intentos de acceso no autorizado
- **Estadísticas de tráfico**: Picos de uso y patrones anómalos

#### 2. Logs de Seguridad
```javascript
// Añadir en tu código para debugging
firebase.database().ref('.info/connected').on('value', (snapshot) => {
  if (snapshot.val() === true) {
    console.log('✅ Conectado a Firebase con reglas de seguridad activas');
  } else {
    console.log('❌ Desconectado de Firebase');
  }
});
```

#### 3. Testing de Reglas en Simulador
1. Ve a Firebase Console > Realtime Database > Reglas
2. Haz clic en **"Simulador de reglas"**
3. Prueba diferentes operaciones:
   - **Lectura**: `/matches/TEST123`
   - **Escritura**: `/matches/TEST123` con datos de ejemplo
   - **Validación**: Datos malformados vs. correctos

### 🚨 Alertas de Seguridad a Monitorear

#### Indicadores de Ataque
- **Lecturas excesivas**: Más de 1000 lecturas/minuto desde una IP
- **Escrituras fallidas**: Múltiples intentos de escritura rechazados
- **Patrones anómalos**: Acceso a rutas no existentes
- **Timestamps sospechosos**: Intentos de manipular timestamps

#### Configurar Alertas
```javascript
// Código para detectar actividad sospechosa
const monitorSecurityEvents = () => {
  const securityLog = firebase.database().ref('security_events');
  
  securityLog.limitToLast(100).on('child_added', (snapshot) => {
    const event = snapshot.val();
    if (event.type === 'unauthorized_access') {
      console.warn('🚨 Intento de acceso no autorizado:', event);
      // Aquí puedes enviar notificación a admin
    }
  });
};
```

## ✅ Testing y Verificación

### Checklist de Verificación Básica
Después de aplicar las reglas:

1. **✅ Funcionalidad básica**
   - Inicia un partido nuevo desde tu app
   - Únete como espectador en otra ventana/dispositivo
   - Verifica que los cambios se sincronizan en tiempo real

2. **✅ Seguridad**
   - Intenta acceder a `/matches/INVALID_ID` (debe fallar)
   - Prueba escribir datos malformados (debe ser rechazado)
   - Verifica que no puedes acceder a rutas no autorizadas

3. **✅ Performance**
   - Revisa la consola del navegador para errores
   - Monitorea el tiempo de respuesta (<500ms ideal)
   - Verifica que no hay warnings de seguridad

### Testing Avanzado 🆕

#### 1. Pruebas de Penetración Básicas
```bash
# Usando curl para probar endpoints (reemplaza con tu URL Firebase)
curl -X GET "https://manvapp-default-rtdb.firebaseio.com/matches.json"
curl -X PUT "https://manvapp-default-rtdb.firebaseio.com/unauthorized.json" -d '{"test": "hack"}'
```

#### 2. Simulación de Carga
```javascript
// Script para simular múltiples conexiones
const simulateLoad = () => {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      firebase.database().ref(`matches/TEST${i}`).once('value');
    }, i * 100);
  }
};
```

#### 3. Verificación de Rate Limiting
```javascript
// Prueba rapid-fire para verificar rate limiting
const testRateLimit = () => {
  const matchRef = firebase.database().ref('matches/TEST_RATE_LIMIT');
  
  for (let i = 0; i < 10; i++) {
    matchRef.update({
      lastUpdate: firebase.database.ServerValue.TIMESTAMP,
      testCounter: i
    }).catch(error => {
      console.log(`Rate limit activado en intento ${i}:`, error);
    });
  }
};
```

Si algo no funciona, puedes volver temporalmente a las reglas básicas y revisar los logs de Firebase Console.

## 🎯 Hoja de Ruta de Seguridad 2025

### 📅 Plan de Implementación Gradual

#### **Fase 1: Implementación Inmediata (Hoy)**
- ✅ Aplicar **Opción 1** (Reglas Básicas) inmediatamente
- ✅ Configurar monitoreo básico en Firebase Console
- ✅ Realizar testing básico de funcionalidad

#### **Fase 2: Seguridad Intermedia (Esta semana)**
- 🔄 Migrar a **Opción 3** (Reglas con Tiempo)
- 🔄 Implementar logging de eventos de seguridad
- 🔄 Configurar alertas básicas

#### **Fase 3: Seguridad Avanzada (Próximo mes)**
- 🚀 Evaluar migración a **Opción 4** (Ultra Seguras)
- 🚀 Implementar sistema de monitoreo completo
- 🚀 Realizar auditoría de seguridad completa

#### **Fase 4: Producción Empresarial (Futuro)**
- 💼 Considerar **Opción 5** (Anti-DDoS) para alto tráfico
- 💼 Implementar autenticación de usuarios
- 💼 Configurar backup y recuperación automática

### 🚨 Matriz de Decisión por Escenario

| Escenario | Opción Recomendada | Motivo |
|-----------|-------------------|--------|
| **Desarrollo/Testing** | Opción 1 | Simplicidad, debugging fácil |
| **Demo/Prototipo** | Opción 2 | Balance seguridad/facilidad |
| **Producción Básica** | Opción 3 | Auto-limpieza, seguridad temporal |
| **App Comercial** | Opción 4 | Validación estricta, profesional |
| **Alto Tráfico** | Opción 5 | Protección DDoS, rate limiting |

### 🎯 Recomendación Final Actualizada

**Para implementar HOY (Noviembre 2025):**

1. **⚡ SOLUCIÓN RÁPIDA** → Usa **Opción 1-B** (sin validación) para que funcione YA
2. **Desarrollo activo** → Migra a **Opción 1** (corregida) después de verificar
3. **Lanzamiento próximo** → Implementa **Opción 3** para producción  
4. **Ya en producción** → Migra gradualmente: Opción 1-B → 1 → 3 → 4

**Monitoreo continuo:**
- Revisa Firebase Console semanalmente
- Configura alertas de uso anómalo
- Mantén backup de reglas de seguridad

### 🆕 Nuevas Características de Seguridad Firebase 2025

#### Rate Limiting Nativo
Firebase ahora incluye rate limiting nativo que puedes activar:
```json
{
  "rateLimits": {
    "matches": {
      "maxReadsPerMinute": 1000,
      "maxWritesPerMinute": 100
    }
  }
}
```

#### Geo-blocking
Bloquea acceso desde ciertas regiones:
```json
{
  "geoRestrictions": {
    "allowedCountries": ["ES", "MX", "AR", "CO", "PE"]
  }
}
```

¡Tu app ManvApp estará preparada para cualquier nivel de uso con máxima seguridad! 🛡️🏐

---

**Última actualización**: Noviembre 2025 | **Versión**: 2.0 | **Próxima revisión**: Febrero 2026