import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

export async function hapticLight() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {
    console.warn("Haptic light failed", e);
  }
}

export async function hapticMedium() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (e) {
    console.warn("Haptic medium failed", e);
  }
}

export async function hapticSuccess() {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (e) {
    console.warn("Haptic success notification failed", e);
  }
}
