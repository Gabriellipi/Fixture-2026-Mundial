import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fixturedigital.app2026",
  appName: "Fixture Digital 2026",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#020617",
    preferredContentMode: "mobile",
  },
  android: {
    backgroundColor: "#020617",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#020617",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#020617",
    },
  },
};

export default config;
