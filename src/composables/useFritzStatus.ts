import { ref, onMounted, onUnmounted } from 'vue';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useFritzStatus() {
  const serverOnline = ref(false);
  const uptime = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  async function checkHealth() {
    try {
      const res = await fetch(`${API}/api/health`);
      if (res.ok) {
        const json = await res.json();
        serverOnline.value = true;
        uptime.value = Math.floor(json.uptime);
      } else {
        serverOnline.value = false;
      }
    } catch {
      serverOnline.value = false;
    }
  }

  onMounted(() => {
    void checkHealth();
    timer = setInterval(() => { void checkHealth(); }, 30_000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { serverOnline, uptime, checkHealth };
}
