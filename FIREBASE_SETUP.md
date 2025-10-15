# 🔥 Configuración Firebase para Streaming en Tiempo Real

## 📋 Pasos de Configuración

### 1. Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `manvapp-volleyball` (o el que prefieras)
4. Deshabilita Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### 2. Configurar Realtime Database
1. En el panel lateral, ve a **Build** > **Realtime Database**
2. Haz clic en "Crear base de datos"
3. Selecciona ubicación (preferiblemente cerca de tus usuarios)
4. Inicia en **modo de prueba** por ahora
5. Haz clic en "Listo"

### 3. Obtener Configuración Web
1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Baja hasta "Tus aplicaciones"
3. Haz clic en el ícono web `</>`
4. Nombre de la app: `ManvApp Scoreboard`
5. **NO** marques "Firebase Hosting"
6. Haz clic en "Registrar app"
7. **Copia todo el objeto `firebaseConfig`**

### 4. Configurar la Aplicación
1. Abre el archivo `js/firebase-config.js`
2. Reemplaza la configuración ejemplo con tu configuración real:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Configurar Reglas de Seguridad (Opcional)
En Realtime Database > Reglas, puedes usar estas reglas básicas:

```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['teamA', 'teamB', 'currentSet'])"
      }
    }
  }
}
```

## 🚀 Funcionalidades Implementadas

### Para el Árbitro (Controlador)
- ✅ Iniciar streaming con ID único de partido
- ✅ Controlar marcador en tiempo real
- ✅ Ver usuarios conectados
- ✅ Compartir enlace/QR del partido
- ✅ Detener streaming

### Para Espectadores
- ✅ Unirse con ID de partido
- ✅ Ver marcador en tiempo real
- ✅ Recibir actualizaciones automáticas
- ✅ Unirse escaneando QR
- ✅ Exportar resultados

### Características Técnicas
- 🔥 **Tiempo real**: Actualizaciones instantáneas (< 100ms)
- 📱 **Códigos QR**: Generación automática para compartir
- 🔗 **URLs compartibles**: Enlaces directos para espectadores
- 👥 **Contador de usuarios**: Ver cuántos están conectados
- 🌙 **Dark/Light mode**: Compatible con ambos temas
- 📱 **Responsive**: Funciona en móviles y tablets
- 🔒 **Seguro**: Cada partido tiene ID único

## 🎯 Cómo Usar

### Modo Árbitro
1. Haz clic en "👨‍⚖️ Iniciar como Árbitro"
2. Se genera automáticamente un ID de partido
3. Comparte el QR o enlace con espectadores
4. Controla el marcador normalmente
5. Los cambios se envían automáticamente

### Modo Espectador
1. Escanea QR o usa enlace compartido
2. O haz clic en "👁️ Unirse como Espectador"
3. Ingresa el ID del partido
4. ¡Disfruta el partido en tiempo real!

## 🆓 Límites del Plan Gratuito Firebase

- **100 usuarios simultáneos**
- **10 GB de transferencia mensual**
- **1 GB de almacenamiento**

¡Más que suficiente para torneos locales!

## ⚠️ Notas Importantes

- La configuración debe hacerse **antes** del primer uso
- Los espectadores no pueden controlar el marcador
- El streaming se detiene si el árbitro cierra la página
- Los datos se eliminan automáticamente al finalizar
- Compatible 100% con GitHub Pages

## 🔧 Troubleshooting

**Error: "Firebase not configured"**
- Verifica que reemplazaste la configuración en `firebase-config.js`

**Error: "Permission denied"**
- Revisa las reglas de seguridad en Firebase Console

**No aparecen las opciones de streaming**
- Recarga la página después de configurar Firebase
- Verifica la consola del navegador para errores

¡Listo para streaming en vivo! 🎉