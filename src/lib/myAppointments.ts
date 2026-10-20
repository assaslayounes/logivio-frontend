const STORAGE_KEY = "capaflow_my_appointments";

export interface SavedAppointment {
  qrCode: string;
  plateNumber: string;
  createdAt: string;
}

export function getSavedAppointments(): SavedAppointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAppointment(entry: SavedAppointment) {
  const current = getSavedAppointments();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...current].slice(0, 10)));
}

export function removeSavedAppointment(qrCode: string) {
  const current = getSavedAppointments().filter((a) => a.qrCode !== qrCode);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function clearSavedAppointments() {
  localStorage.removeItem(STORAGE_KEY);
}
