import { useState } from 'react';
import { z } from 'zod';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
}

export const useFormValidation = <T>({ schema, initialValues }: UseFormValidationOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validate = (data: T): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        setIsValid(false);
        return false;
      }
      return false;
    }
  };

  const setValue = (field: keyof T, value: any) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    validate(newValues);
  };

  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsValid(false);
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field];
  };

  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    isValid,
    validate,
    setValue,
    setFieldError,
    clearErrors,
    reset,
    getFieldError,
    hasErrors,
  };
};
