# 🔥 CONFIGURACIÓN DE FIREBASE PARA FINFLOW

## ⚠️ ERROR ACTUAL
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

**Causa:** El archivo `.env` tiene credenciales de ejemplo que no son válidas.

---

## 🚀 SOLUCIÓN EN 7 PASOS

### PASO 1: Ir a Firebase Console
🔗 **https://console.firebase.google.com/**

### PASO 2: Crear Proyecto
1. Clic en **"Add project"** o **"Agregar proyecto"**
2. Nombre: `finflow-app` (o el que prefieras)
3. Desactiva Google Analytics (opcional)
4. Clic en **"Create project"**

### PASO 3: Habilitar Authentication
1. Panel izquierdo → **"Authentication"** 🔐
2. Clic en **"Get Started"**
3. Pestaña **"Sign-in method"**
4. Clic en **"Email/Password"**
5. **Activar** el toggle
6. Clic en **"Save"**

✅ Verificación: Deberías ver "Email/Password" marcado como "Enabled"

### PASO 4: Crear Firestore Database
1. Panel izquierdo → **"Firestore Database"** 🗄️
2. Clic en **"Create database"**
3. Selecciona **"Start in production mode"**
4. Elige ubicación cercana a ti
5. Clic en **"Enable"**

### PASO 5: Configurar Reglas de Seguridad
1. Firestore Database → Pestaña **"Rules"**
2. **REEMPLAZA TODO** con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clic en **"Publish"**

### PASO 6: Obtener Credenciales
1. Clic en **⚙️** (arriba izquierda)
2. **"Project settings"**
3. Scroll down → **"Your apps"**
4. Si no hay apps, clic en **"</>"** (Web)
5. Registrar app:
   - Nickname: `FinFlow Web`
   - Clic en **"Register app"**

6. **COPIA** las credenciales que aparecen:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← COPIAR
  authDomain: "xxx.firebaseapp.com",  // ← COPIAR
  projectId: "xxx",              // ← COPIAR
  storageBucket: "xxx.appspot.com",   // ← COPIAR
  messagingSenderId: "123...",   // ← COPIAR
  appId: "1:123..."              // ← COPIAR
};
```

### PASO 7: Actualizar .env
1. Abre el archivo `.env` en la raíz del proyecto
2. **REEMPLAZA** los valores de ejemplo con tus credenciales reales:

**ANTES (INCORRECTO):**
```env
REACT_APP_FIREBASE_API_KEY=TU_API_KEY_AQUI
```

**DESPUÉS (CORRECTO):**
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr
```

3. Guarda el archivo `.env`

---

## 🔄 PASO FINAL: Reiniciar Servidor

**IMPORTANTE:** Debes reiniciar el servidor de desarrollo para que lea el nuevo `.env`

```bash
# 1. Detén el servidor actual (Ctrl+C)
# 2. Inicia de nuevo:
npm start
```

---

## ✅ VERIFICACIÓN

Después de configurar Firebase y reiniciar el servidor:

1. Abre la app en el navegador
2. Deberías ver la pantalla de Login
3. Clic en **"Crear cuenta"**
4. Ingresa email y password
5. Si NO sale error → **¡TODO FUNCIONÓ!** ✅
6. Si sale error → revisa la consola del navegador (F12)

---

## 🐛 TROUBLESHOOTING

### Error: "api-key-not-valid"
- ✅ Verifica que copiaste el API Key completo de Firebase
- ✅ Verifica que NO hay espacios antes/después del valor en .env
- ✅ Verifica que reiniciaste el servidor (`npm start`)

### Error: "auth/operation-not-allowed"
- ✅ Verifica que habilitaste Email/Password en Authentication

### Error: "missing or insufficient permissions"
- ✅ Verifica que publicaste las reglas de seguridad en Firestore

### Cambios en .env no se aplican
- ✅ DEBES reiniciar el servidor completamente
- ✅ Detén con Ctrl+C, luego `npm start` de nuevo

---

## 📝 EJEMPLO COMPLETO DE .env

```env
# Ejemplo con valores REALES (los tuyos serán diferentes)
REACT_APP_FIREBASE_API_KEY=AIzaSyBmNhf0_T2rKlP9XzQwErTyUiOpAsD1fGh
REACT_APP_FIREBASE_AUTH_DOMAIN=finflow-production.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=finflow-production
REACT_APP_FIREBASE_STORAGE_BUCKET=finflow-production.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=987654321012
REACT_APP_FIREBASE_APP_ID=1:987654321012:web:abc123def456ghi789jkl
```

---

## 🔒 SEGURIDAD

✅ El archivo `.env` está en `.gitignore` (no se subirá a Git)
✅ Las reglas de Firestore protegen los datos de cada usuario
✅ Solo usuarios autenticados pueden acceder a sus propios datos

---

## 📚 RECURSOS

- Firebase Console: https://console.firebase.google.com/
- Documentación de Firebase Auth: https://firebase.google.com/docs/auth
- Documentación de Firestore: https://firebase.google.com/docs/firestore

---

## 💡 TIPS

1. **Guarda tus credenciales** en un lugar seguro (gestor de contraseñas)
2. **No compartas** el archivo .env
3. **No hagas commit** del .env al repositorio
4. Si trabajas en equipo, cada uno debe crear su propio proyecto de Firebase para desarrollo

---

¡Listo! Después de seguir estos pasos, podrás crear cuentas y sincronizar datos en la nube. 🎉
