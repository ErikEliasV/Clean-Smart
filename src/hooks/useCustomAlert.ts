import { useState } from 'react';

export interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const useCustomAlert = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false
  });

  const showAlert = (options: AlertOptions) => {
    setAlertOptions({
      ...options,
      onConfirm: () => {
        options.onConfirm?.();
        setAlertVisible(false);
      },
      onCancel: () => {
        options.onCancel?.();
        setAlertVisible(false);
      }
    });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  return {
    alertVisible,
    alertOptions,
    showAlert,
    hideAlert
  };
};
