# 🏐 ManvApp - Manual de Usuario
### Marcador de Voleibol en Tiempo Real

---

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Acceso a la Aplicación](#acceso-a-la-aplicación)
3. [Funciones Principales](#funciones-principales)
4. [Modo Árbitro](#modo-árbitro)
5. [Modo Espectador](#modo-espectador)
6. [Marcador Offline](#marcador-offline)
7. [Atajos de Teclado](#atajos-de-teclado)
8. [Exportación de Datos](#exportación-de-datos)
9. [Configuración](#configuración)
10. [Resolución de Problemas](#resolución-de-problemas)

---

## 🎯 Introducción

**ManvApp** es una aplicación web moderna para llevar el marcador de partidos de voleibol con capacidades de streaming en tiempo real. Permite a árbitros controlar el marcador y compartir el partido en vivo con espectadores que pueden seguir la acción desde cualquier dispositivo.

### Características Principales
- ✅ **Marcador en tiempo real** para voleibol
- ✅ **Reglas oficiales** (25 puntos, ganar por 2)
- ✅ **Streaming en vivo** con Firebase
- ✅ **Códigos QR** para compartir partidos
- ✅ **Modo offline** sin internet
- ✅ **Responsive** para móviles y tablets
- ✅ **Tema oscuro/claro**
- ✅ **Exportación de resultados**

---

## 🌐 Acceso a la Aplicación

### URL Principal
**Demo en vivo**: [https://r-alonso-igme.github.io/manvapp](https://r-alonso-igme.github.io/manvapp)

### Requisitos del Sistema
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Conexión a internet** (para streaming en vivo)
- **JavaScript habilitado**

### Compatibilidad de Dispositivos
- 💻 **Ordenadores** - Experiencia completa
- 📱 **Móviles** - Optimizado para uso en cancha
- 📱 **Tablets** - Ideal para árbitros
- 🖥️ **Smart TV** - Perfecto para espectadores

---

## ⚙️ Funciones Principales

### Interfaz Principal
Al abrir la aplicación verás:

1. **Navegación superior** con tema claro/oscuro 🌙/☀️
2. **Sección "Marcador"** - El corazón de la aplicación
3. **Controles de streaming** (si Firebase está configurado)

### Temas Visuales
- 🌙 **Tema Oscuro** - Ideal para uso nocturno
- ☀️ **Tema Claro** - Mejor visibilidad diurna
- 🔄 **Cambio automático** - Guarda tu preferencia

---

## 👨‍⚖️ Modo Árbitro

### Acceso como Árbitro
1. Haz clic en **"👨‍⚖️ Iniciar como Árbitro"**
2. Ingresa la **contraseña de administrador**
   - Contraseñas por defecto: `admin123`, `referee2024`, `voleibol`
3. Se creará automáticamente un **ID único de partido**

### Controles de Árbitro

#### Marcador Básico
- **Agregar puntos**: Botones `+` o clic en nombre del equipo
- **Quitar puntos**: Botones `-` (solo si el puntaje > 0)
- **Nombres de equipos**: Clic en el nombre para editarlo
- **Tipo de partido**: Selector "Mejor de 3/5 sets"

#### Controles Avanzados
- 🆕 **Nuevo Partido** - Reinicia todo el marcador
- 🔄 **Reiniciar Set** - Solo el set actual
- ↩️ **Deshacer** - Revierte la última acción
- 📤 **Exportar Resultado** - Genera resultado actual
- 📋 **Exportar Historial** - Historial completo de sets

#### Gestión de Tiempos
- ⏱️ **Tiempo Muerto** - Checkbox para activar
- ➕ **Agregar tiempo** por equipo (máximo 2 por set)
- ➖ **Quitar tiempo** si se marcó por error

### Compartir Partido

#### Opciones de Compartir
- 📱 **Compartir Partido** - Enlace directo
- 📱 **Mostrar QR** - Código para escanear
- 🔗 **URL automática** - Se copia al portapapeles

#### Información del Partido
- **ID del Partido**: Código único de 8 caracteres
- **Usuarios Conectados**: Contador en tiempo real
- **Tiempo Activo**: Cronómetro desde inicio de streaming

### Detener Streaming
- ⏹️ **Detener Streaming** - Finaliza transmisión en vivo
- ❓ **Confirmación requerida** - Evita paradas accidentales

---

## 👁️ Modo Espectador

### Unirse como Espectador

#### Método 1: Código QR
1. Escanea el **código QR** mostrado por el árbitro
2. Se abrirá automáticamente en modo espectador

#### Método 2: ID de Partido
1. Haz clic en **"👁️ Unirse como Espectador"**
2. Ingresa el **ID del partido** (8 caracteres)
3. Confirma para conectarte

#### Método 3: Enlace Directo
1. Usa el enlace compartido por el árbitro
2. Se abrirá directamente en modo espectador

### Interfaz de Espectador

#### Lo que PUEDES hacer
- ✅ **Ver marcador** en tiempo real
- ✅ **Seguir historial** de sets
- ✅ **Exportar resultados** para compartir
- ✅ **Ver información** del partido
- ✅ **Cambiar tema** visual

#### Lo que NO puedes hacer
- ❌ **Modificar puntajes** - Solo lectura
- ❌ **Cambiar nombres** de equipos
- ❌ **Controlar tiempos** - Sin acceso
- ❌ **Reiniciar partido** - Solo árbitros
- ❌ **Deshacer acciones** - Sin permisos

### Indicadores Visuales
- 🔴 **EN VIVO** - Confirmación de conexión activa
- ⏱️ **Tiempo de Transmisión** - Duración del streaming
- 👥 **Usuarios Conectados** - Cuántos están viendo

---

## 🖥️ Marcador Offline

### Uso Sin Internet
Si no hay conexión a internet o Firebase no está configurado:

#### Funcionalidad Completa
- ✅ **Todo el marcador funciona** normalmente
- ✅ **Todas las reglas** de voleibol aplicadas
- ✅ **Atajos de teclado** disponibles
- ✅ **Exportación** de resultados

#### Limitaciones
- ❌ **Sin streaming** en tiempo real
- ❌ **Sin compartir** con otros dispositivos
- ❌ **Sin códigos QR**

### Reglas de Voleibol Implementadas

#### Puntuación
- **Ganar set**: 25 puntos mínimo, diferencia de 2
- **Set decisivo**: 15 puntos (quinto set)
- **Sin límite superior** de puntos

#### Formatos de Partido
- **Mejor de 3 sets**: Ganar 2 sets
- **Mejor de 5 sets**: Ganar 3 sets
- **Cambio automático** al siguiente set

#### Gestión de Sets
- **Historial completo** de resultados
- **Visualización clara** del ganador de cada set
- **Progreso actual** siempre visible

---

## ⌨️ Atajos de Teclado

### Controles Rápidos
| Tecla | Acción |
|-------|--------|
| `A` | ➕ Punto para Equipo A |
| `S` | ➖ Quitar punto Equipo A |
| `L` | ➕ Punto para Equipo B |
| `K` | ➖ Quitar punto Equipo B |
| `N` | 🆕 Nuevo Partido |
| `U` | ↩️ Deshacer última acción |
| `R` | 🔄 Reiniciar set actual |

### Consejos de Uso
- 💡 **Más rápido que el ratón** para partidos intensos
- 💡 **Funciona solo cuando** no estás escribiendo en campos de texto
- 💡 **Ideal para árbitros** que necesitan velocidad
- 💡 **Disponible en móviles** con teclado externo

---

## 📤 Exportación de Datos

### Exportar Resultado Actual
Genera formato: `[puntos_local]:[puntos_visitante] (sets_local/sets_visitante) [Tiempo]`

**Ejemplo**: `25:23 (2/1) Tiempo`

### Exportar Historial Completo
Formato: `[set1] [set2] [set3] ... (sets_ganados) [Estado]`

**Ejemplo**: `25:14 24:26 25:22 (2/1) [Set 3]`

### Opciones de Compartir

#### Botón "Portapapeles"
- 📋 **Copia automáticamente** al portapapeles
- ✅ **Confirmación visual** con notificación

#### Botón "Compartir"
En dispositivos compatibles:
- 📱 **WhatsApp** - Envío directo
- ✈️ **Telegram** - Compartir inmediato
- 📧 **Email** - Envío por correo
- 💬 **SMS** - Mensaje de texto

### Casos de Uso
- 🏆 **Resultados oficiales** para torneos
- 📊 **Estadísticas** para entrenadores
- 📱 **Redes sociales** para aficionados
- 📝 **Reportes** para medios

---

## ⚙️ Configuración

### Configuración Firebase (Solo Desarrolladores)

#### Archivos de Configuración
- `js/firebase-config.js` - Credenciales del proyecto
- `FIREBASE_SETUP.md` - Instrucciones completas
- `SECURITY_RULES.md` - Reglas de seguridad

#### Contraseñas de Administrador
Ubicación: `js/realtime-streaming.js`
```javascript
const adminPasswords = [
    'admin123',      // Contraseña básica
    'referee2024',   // Contraseña de árbitro
    'voleibol'       // Contraseña temática
];
```

### Personalización Visual

#### Cambiar Temas
- **Automático**: Botón 🌙/☀️ en la esquina superior derecha
- **Persistente**: Se guarda tu preferencia

#### Colores Personalizados
Archivo: `css/styles.css`
```css
:root {
    --primary-color: #2563eb;    /* Color principal */
    --secondary-color: #64748b;  /* Color secundario */
    /* Personaliza aquí */
}
```

---

## 🆘 Resolución de Problemas

### Problemas Comunes

#### "Firebase not configured"
**Síntomas**: No aparecen opciones de streaming
**Solución**: 
1. Verifica `js/firebase-config.js`
2. Asegúrate que no dice "YOUR_API_KEY"
3. Revisa la consola del navegador

#### "Contraseña incorrecta"
**Síntomas**: No puedes iniciar como árbitro
**Solución**:
1. Prueba: `admin123`, `referee2024`, `voleibol`
2. Contacta al administrador del sistema
3. Verifica mayúsculas/minúsculas

#### "Partido no encontrado"
**Síntomas**: Error al unirse como espectador
**Solución**:
1. Verifica el **ID del partido** (8 caracteres)
2. Confirma que el árbitro **sigue en línea**
3. Intenta de nuevo en unos segundos

#### Marcador no se actualiza
**Síntomas**: Cambios no se ven en otros dispositivos
**Solución**:
1. Verifica **conexión a internet**
2. Recarga la página (F5)
3. Confirma que estás como **árbitro**, no espectador

### Problemas de Conectividad

#### Internet Lento
- ✅ **La app funciona** con conexiones lentas
- ⚠️ **Puede haber retraso** en actualizaciones
- 💡 **Usa modo offline** si es necesario

#### Sin Internet
- ✅ **Marcador completo** disponible
- ❌ **Sin streaming** en vivo
- 💡 **Exporta resultados** para compartir después

### Compatibilidad de Navegadores

#### Navegadores Soportados
- ✅ **Chrome** 70+ (Recomendado)
- ✅ **Firefox** 65+
- ✅ **Safari** 12+
- ✅ **Edge** 79+

#### Navegadores No Soportados
- ❌ **Internet Explorer** (cualquier versión)
- ❌ **Navegadores muy antiguos** (anteriores a 2018)

---

## 📞 Soporte y Contacto

### Obtener Ayuda
1. **GitHub Issues**: [Crear un issue](https://github.com/r-alonso-igme/manvapp/issues)
2. **Formulario de contacto** en la página web
3. **Documentación adicional** en el repositorio

### Reportar Problemas
Al reportar un problema, incluye:
- 🖥️ **Navegador y versión**
- 📱 **Tipo de dispositivo**
- 🔍 **Pasos para reproducir**
- 📸 **Capturas de pantalla** si es posible
- 💬 **Mensaje de error** exacto

### Solicitar Funciones
- 💡 **Ideas nuevas** siempre bienvenidas
- 🏐 **Funciones específicas** de voleibol
- 📱 **Mejoras de interfaz**
- ⚡ **Optimizaciones de rendimiento**

---

## 🏆 Casos de Uso Reales

### Torneos Oficiales
- 👨‍⚖️ **Árbitro principal** controla marcador oficial
- 📱 **Espectadores** siguen desde las gradas
- 📊 **Exportación inmediata** de resultados
- 🏆 **Historial completo** para estadísticas

### Entrenamientos
- 🏃‍♂️ **Entrenador** lleva marcador durante práctica
- 👥 **Jugadores** ven progreso en tiempo real
- 📈 **Análisis** de rendimiento por sets
- 💪 **Motivación** con marcador visible

### Partidos Recreativos
- 🏖️ **Voleibol playa** con amigos
- 🎉 **Eventos sociales** deportivos
- 📱 **Compartir** momentos divertidos
- 🥇 **Competiciones** informales

### Uso Educativo
- 🎓 **Clases de educación física**
- 📚 **Aprendizaje** de reglas de voleibol
- 👨‍🏫 **Herramienta didáctica** para profesores
- 🧮 **Práctica** de puntuación deportiva

---

## 🎯 Consejos y Trucos

### Para Árbitros
1. **Practica los atajos** de teclado antes del partido
2. **Verifica conexión** antes de iniciar streaming
3. **Comparte QR** en lugar de dictar el ID
4. **Usa tema oscuro** en exteriores soleados
5. **Exporta resultados** inmediatamente al finalizar

### Para Espectadores
1. **Guarda el enlace** del partido como favorito
2. **Activa modo avión** y vuelve a conectar si hay problemas
3. **Usa tablet horizontal** para mejor visualización
4. **Exporta resultado** para compartir en redes sociales

### Para Organizadores
1. **Capacita árbitros** en el uso de la aplicación
2. **Prepara WiFi robusto** para eventos grandes
3. **Designa árbitro backup** que conozca la app
4. **Documenta contraseñas** de administrador
5. **Prueba todo** antes del evento oficial

---

## 📊 Especificaciones Técnicas

### Rendimiento
- **Tiempo de carga**: < 2 segundos
- **Actualización en tiempo real**: < 100ms
- **Usuarios simultáneos**: Hasta 100 (plan gratuito Firebase)
- **Transferencia mensual**: 10GB (plan gratuito)

### Almacenamiento
- **Datos del partido**: Se eliminan automáticamente al finalizar
- **Configuración personal**: Guardada en el navegador local
- **Sin registro**: No se almacenan datos personales

### Seguridad
- **HTTPS**: Conexión segura siempre
- **Contraseñas**: Solo para árbitros
- **Datos temporales**: No persistencia a largo plazo
- **Sin tracking**: Respeto a la privacidad

---

¡Disfruta usando ManvApp para tus partidos de voleibol! 🏐🎉

**Versión**: 1.0.0 | **Última actualización**: Noviembre 2025