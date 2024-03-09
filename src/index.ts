import { useEffect, useRef } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';

export const useScanner = (onSuccess?: (event: any) => void) => {
  const ref = useRef<any>();

  const removeListener = () => {
    if (ref.current) {
      ref.current?.remove();
      ref.current = null;
    }
  };

  useEffect(() => {
    removeListener();

    if (Platform.OS === 'ios') {
      // TODO
    } else {
      ref.current = DeviceEventEmitter.addListener('onExternalScan', (data) => {
        onSuccess?.(data);
      });
    }
  }, [onSuccess]);
};
