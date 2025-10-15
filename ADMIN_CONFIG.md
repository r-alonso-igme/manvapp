# 🔐 Configuración de Administrador

## Contraseñas de Administrador

Para mayor seguridad, las contraseñas de administrador están definidas en el código JavaScript. Para cambiarlas:

1. Abre `js/realtime-streaming.js`
2. Busca la función `verifyAdminPassword`
3. Modifica el array `adminPasswords`

### Contraseñas Actuales:
- `admin123` - Contraseña básica de administrador
- `referee2024` - Contraseña específica para árbitros
- `voleibol` - Contraseña temática del deporte

## 🔒 Recomendaciones de Seguridad

### Para Producción:
1. **Cambia las contraseñas por defecto**
2. **Usa contraseñas más complejas**
3. **Considera implementar autenticación con Firebase Auth**
4. **Rota las contraseñas regularmente**

### Ejemplos de Contraseñas Seguras:
```javascript
const adminPasswords = [
    'ArbitroSeguro2024!',
    'VolleyAdmin@2024',
    'TorneoOficial#123'
];
```

## 🎯 Funcionalidad

### Administradores (Árbitros):
- **Iniciar streaming** como árbitro (requiere contraseña)
- **Compartir partido** y generar enlaces (acceso directo durante streaming)
- **Mostrar códigos QR** para fácil acceso (acceso directo durante streaming)
- **Detener streaming** activo (acceso directo durante streaming)
- **Control completo** del marcador y configuración
- **Exportar datos** del partido e historial

### Espectadores:
- **Unirse libremente** sin contraseñas
- **Ver marcador** en tiempo real
- **Sin acceso** a controles de puntuación
- **Sin acceso** a botones de exportación
- **Sin acceso** a controles de partido (Nuevo Partido, Deshacer)
- **Sin posibilidad** de modificar nombres de equipos
- **Interfaz de solo lectura** para garantizar integridad del partido

## 🔧 Personalización

Para cambiar el mensaje de autenticación, busca en `startAsReferee()`:
```javascript
const adminPassword = prompt('🔐 Contraseña de Administrador:');
```

Para cambiar el mensaje de error:
```javascript
showNotification('❌ Contraseña incorrecta...', 'error');
```

## 📱 Experiencia de Usuario

1. Usuario hace clic en "🔐 Iniciar como Árbitro"
2. Aparece prompt pidiendo contraseña
3. Si es correcta: Se inicia el streaming
4. Si es incorrecta: Mensaje de error y acceso denegado
5. Los espectadores no necesitan contraseña

¡El sistema está listo para uso en torneos oficiales! 🏐