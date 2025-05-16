// components/ui/Input.tsx
import React, { InputHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';

interface BaseInputProps {
  label: string;
  name: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

interface HtmlInputProps extends InputHTMLAttributes<HTMLInputElement> {}
interface HtmlTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

type InputFieldProps = BaseInputProps & HtmlInputProps & { isTextArea?: false | undefined };
type TextAreaFieldProps = BaseInputProps & HtmlTextareaProps & { isTextArea: true };

type CombinedInputProps = InputFieldProps | TextAreaFieldProps;

const Input: React.FC<CombinedInputProps> = (allProps) => {
  // Деструктурируем сначала общие пропсы
  const {
    label,
    name,
    error,
    containerClassName = '',
    labelClassName = 'block text-sm font-medium text-slate-300 mb-1',
    inputClassName = '',
    errorClassName = 'mt-1 text-xs text-red-400',
    isTextArea,
    // 'type' и другие специфичные атрибуты будут в '...props'
    ...props 
  } = allProps;

  const generatedId = useId();
  // props.id может быть undefined, поэтому нужно проверить его наличие перед использованием
  const fieldId = (props as { id?: string }).id || generatedId; 
  // props.required также может быть undefined
  const isRequired = (props as { required?: boolean }).required;


  const commonInputStyles = `w-full px-3 py-2 border rounded-md shadow-sm bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-slate-500`;
  const errorBorderStyles = error ? 'border-red-500 focus:border-red-500 ring-red-500' : 'border-slate-600 focus:border-indigo-500';

  return (
    <div className={`w-full ${containerClassName}`}>
      <label htmlFor={fieldId} className={labelClassName}>
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={fieldId}
          name={name}
          className={`${commonInputStyles} ${errorBorderStyles} ${inputClassName}`}
          // Убеждаемся, что props передаются как атрибуты textarea
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} 
          required={isRequired} // Передаем required явно, если нужно
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          // 'type' берем из props, если он там есть (специфично для InputFieldProps), или используем 'text' по умолчанию
          type={(props as InputFieldProps).type || 'text'} 
          className={`${commonInputStyles} ${errorBorderStyles} ${inputClassName}`}
          // Убеждаемся, что props передаются как атрибуты input
          {...(props as InputHTMLAttributes<HTMLInputElement>)} 
          required={isRequired} // Передаем required явно, если нужно
        />
      )}
      {error && <p className={errorClassName}>{error}</p>}
    </div>
  );
};

export default Input;