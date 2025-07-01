import { useEffect, useState, useCallback, useRef } from 'react';

interface SwitchStates {
  switch1: number | null;
  switch2: number | null;
}

interface UsePicoSwitchesOptions {
  picoIP: string;
  port?: number;
  onSwitch1?: (state: number) => void;
  onSwitch2?: (state: number) => void;
  pollInterval?: number;
}

export const usePicoSwitches = ({
  picoIP,
  port = 8080,
  onSwitch1,
  onSwitch2,
  pollInterval = 3000
}: UsePicoSwitchesOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [switchStates, setSwitchStates] = useState<SwitchStates>({
    switch1: null,
    switch2: null
  });

  const intervalRef = useRef<number | null>(null);
  const lastStatesRef = useRef<SwitchStates>({ switch1: null, switch2: null });
  const consecutiveErrorsRef = useRef(0);
  const maxConsecutiveErrors = 5;

  const pollSwitches = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    try {
      const response = await fetch(`http://${picoIP}:${port}/switches`, {
        method: 'GET',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      consecutiveErrorsRef.current = 0;
      setIsConnected(true);
      setSwitchStates(data);

      const lastStates = lastStatesRef.current;

      if (lastStates.switch1 !== null && data.switch1 !== lastStates.switch1) {
        console.log(`Switch 1 changed: ${lastStates.switch1} -> ${data.switch1}`);
        onSwitch1?.(data.switch1);
      }

      if (lastStates.switch2 !== null && data.switch2 !== lastStates.switch2) {
        console.log(`Switch 2 changed: ${lastStates.switch2} -> ${data.switch2}`);
        onSwitch2?.(data.switch2);
      }

      lastStatesRef.current = data;

    } catch (error) {
      consecutiveErrorsRef.current += 1;

      if (consecutiveErrorsRef.current >= maxConsecutiveErrors) {
        setIsConnected(false);
        stopPolling(); // Stop current polling
        console.warn("Polling stopped due to repeated errors");
      }

      if (consecutiveErrorsRef.current % 10 === 1) {
        console.error(`Pico polling error (${consecutiveErrorsRef.current}):`, error);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }, [picoIP, port, onSwitch1, onSwitch2]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    pollSwitches(); // initial call
    intervalRef.current = setInterval(pollSwitches, pollInterval);
  }, [pollSwitches, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start polling on mount
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // Auto-reconnect if disconnected
  useEffect(() => {
    if (!isConnected && !intervalRef.current) {
      const retryTimer = setTimeout(() => {
        console.log("Attempting to reconnect to Pico...");
        startPolling();
      }, 3000); // 3-second retry delay

      return () => clearTimeout(retryTimer);
    }
  }, [isConnected, startPolling]);

  return {
    isConnected,
    switchStates,
    reconnect: startPolling,
    disconnect: stopPolling
  };
};
