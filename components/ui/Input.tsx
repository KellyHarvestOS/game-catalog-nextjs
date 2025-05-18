// components/ui/Input.tsx
import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId } from 'react'; // Добавлен forwardRef

// Определяем общие пропсы
interface BaseInputProps {
  label: string;
  name: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

// Пропсы для input
interface HtmlInputProps extends InputHTMLAttributes<HTMLInputElement> {}
// Пропсы для textarea
interface HtmlTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Типы для полей
type InputFieldProps = BaseInputProps & HtmlInputProps & { isTextArea?: false | undefined };
type TextAreaFieldProps = BaseInputProps & HtmlTextareaProps & { isTextArea: true };

// Общий тип, который также включает ref (он будет добавлен React.ForwardRefExoticComponent)
export type CombinedInputProps = InputFieldProps | TextAreaFieldProps;

// Используем forwardRef
const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement, // Тип DOM-элемента, на который будет указывать ref
  CombinedInputProps                     // Тип пропсов компонента
>(
  (allProps, ref) => { // ref теперь второй аргумент
    const {
      label,
      name,
      error,
      containerClassName = '',
      labelClassName = 'block text-sm font-medium text-slate-300 mb-1',
      inputClassName = '', // Этот класс будет добавлен К СУЩЕСТВУЮЩИМ стилям инпута
      errorClassName = 'mt-1 text-xs text-red-400',
      isTextArea,
      ...props
    } = allProps;

    const generatedId = useId();
    const fieldId = (props as { id?: string }).id || name || generatedId;
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
            ref={ref as React.Ref<HTMLTextAreaElement>} // Применяем ref
            className={`${commonInputStyles} ${errorBorderStyles} ${inputClassName}`} // inputClassName добавляется сюда
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            required={isRequired}
          />
        ) : (
          <input
            id={fieldId}
            name={name}
            type={(props as InputFieldProps).type || 'text'}
            ref={ref as React.Ref<HTMLInputElement>} // Применяем ref
            className={`${commonInputStyles} ${errorBorderStyles} ${inputClassName}`} // inputClassName добавляется сюда
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
            required={isRequired}
          />
        )}
        {error && <p className={errorClassName}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input"; // Для удобства отладки в React DevTools
export default Input;