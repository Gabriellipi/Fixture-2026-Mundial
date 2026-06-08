# Guía de Publicación en Google Play Console

Esta guía detalla el proceso completo para generar, firmar y preparar la aplicación **World Cup 2026 Fixture & Predictions** para su carga en Google Play Console utilizando la clave existente `Untitled.jks`.

---

## 📋 Requisitos Previos

1. **Java Development Kit (JDK)**: Asegúrate de tener instalado Java 17 o superior.
2. **Android SDK & Command Line Tools**: Configurado a través de Android Studio o la línea de comandos.
3. **Clave de Firmado (`Untitled.jks`)**: Ubicada en la raíz del proyecto.
   * *Nota*: Necesitarás el alias y la contraseña correspondientes de este keystore para poder firmar y generar el bundle.

---

## 🛠️ Paso 1: Generar Assets de Producción y Sincronizar Capacitor

Antes de compilar la parte nativa, debemos compilar el código web (Vite + React) y copiar los archivos construidos a la carpeta del proyecto Android.

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm run build && npx cap sync android
```

Este comando:
1. Compila la aplicación React en el directorio `/dist` con optimizaciones de producción.
2. Sincroniza y copia los assets compilados y los plugins nativos (como `@capacitor/haptics`) al directorio nativo `/android`.

---

## ✍️ Paso 2: Configurar Versión y Firmado en Android

Abre el archivo de configuración Gradle de la aplicación ubicado en `android/app/build.gradle`.

### 1. Incrementar la versión
Modifica los valores de `versionCode` y `versionName` dentro del bloque `defaultConfig` para evitar conflictos con cargas anteriores en la consola:

```groovy
android {
    ...
    defaultConfig {
        applicationId "app.fixture.mundial2026"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 4   // Incrementa este número entero en cada subida (ej. 3 -> 4)
        versionName "1.2" // Nombre visual de la versión (ej. "1.1" -> "1.2")
        ...
    }
}
```

### 2. Configurar el Firmado Seguro (Signing Config)
Para firmar el paquete automáticamente durante el build de producción, añade el bloque `signingConfigs` justo dentro del bloque `android` y configúralo en `buildTypes.release`:

```groovy
android {
    ...
    // Define la configuración de firmado con el keystore de la raíz
    signingConfigs {
        release {
            storeFile file("../../Untitled.jks")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: "TU_CONTRASEÑA_KEYSTORE"
            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: "TU_ALIAS"
            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: "TU_CONTRASEÑA_KEY"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release // Aplica el firmado a la compilación de lanzamiento
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

> [!TIP]
> Por seguridad, es recomendable usar variables de entorno (como `System.getenv("ANDROID_KEYSTORE_PASSWORD")`) o cargarlas mediante un archivo local como `local.properties` que no se suba al control de versiones (Git), evitando exponer contraseñas en código claro.

---

## 📦 Paso 3: Compilar el Android App Bundle (.aab)

El formato **Android App Bundle (.aab)** es el requerido obligatoriamente por Google Play para nuevas aplicaciones. Optimiza el tamaño de descarga según el dispositivo del usuario.

Navega al directorio de Android y compila la versión de lanzamiento (`release`):

```bash
cd android && ./gradlew bundleRelease
```

Al finalizar la compilación, encontrarás tu archivo firmado listo para subir en la siguiente ruta:
```text
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🚀 Paso 4: Subida y Publicación en Google Play Console

### 1. Crear Aplicación en la Consola
1. Entra a tu cuenta en [Google Play Console](https://play.google.com/console/).
2. Haz clic en **Crear aplicación**.
3. Completa los detalles básicos: nombre, idioma predeterminado y tipo (Aplicación / Gratis).

### 2. Pruebas y el requisito de 20 Testers (Cuentas Personales Nuevas)
> [!IMPORTANT]
> Si tu cuenta de desarrollador fue creada después de **noviembre de 2023**, Google exige realizar **pruebas cerradas** con un mínimo de **20 testers** registrados de manera continua durante al menos **14 días** antes de poder solicitar el acceso a producción.
> * Puedes importar la lista de tus testers designados usando el archivo CSV disponible en la raíz del proyecto: [testers.csv](file:///Users/gabriel/Mundial%202026%20Fixture/testers.csv).

#### Cómo configurar las pruebas:
1. Ve a **Pruebas cerradas** (Closed testing) en el menú izquierdo.
2. Crea una pista (track) y sube tu archivo `app-release.aab`.
3. Ve a la pestaña **Testers** y selecciona una lista de correo de testers o importa tu lista CSV.
4. Comparte el enlace de adhesión (opt-in link) con tus testers para que descarguen y prueben la app.

### 3. Ficha de Play Store y Cuestionarios
Antes de enviar a revisión, asegúrate de completar las siguientes tareas requeridas en el Panel de Control:
* **Declaración de Privacidad**: Utiliza la política disponible en la app o un enlace externo a la política.
* **Clasificación de Contenido**: Completa el cuestionario de IARC para obtener la clasificación por edades.
* **Público Objetivo**: Define los rangos de edad.
* **Ficha de Play Store**: Sube capturas de pantalla de la app (móvil y tablet), descripción corta, descripción larga y un icono de 512x512px.

Una vez pasados los 14 días de pruebas y completada la configuración de la ficha, podrás presionar el botón de **Solicitar publicación en producción**.
