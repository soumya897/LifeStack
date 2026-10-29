import React from 'react';
import {
  FieldDefinition,
  FieldType,
  FieldConfig,
} from '../../../lib/api';
import { Globe, Mail, Calendar, Hash, CheckSquare } from 'lucide-react';

export interface DynamicFormRendererProps {
  fieldDefinitions: FieldDefinition[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function parseFieldConfig(configJson?: string): FieldConfig {
  if (!configJson) return {};
  try {
    return JSON.parse(configJson);
  } catch {
    return {};
  }
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  fieldDefinitions,
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  if (!fieldDefinitions || fieldDefinitions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
        No custom fields defined in this template version.
      </div>
    );
  }

  const sortedFields = [...fieldDefinitions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      {sortedFields.map((field) => {
        const val = values[field.fieldKey];
        const error = errors[field.fieldKey];
        const config = parseFieldConfig(field.config);

        return (
          <div key={field.id || field.fieldKey} className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {renderFieldInput(field, val, config, (newVal) => onChange(field.fieldKey, newVal), disabled)}

            {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
};

function renderFieldInput(
  field: FieldDefinition,
  value: any,
  config: FieldConfig,
  handleChange: (val: any) => void,
  disabled: boolean
) {
  const commonInputClass =
    'w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-500';

  switch (field.fieldType as FieldType) {
    case 'TEXT':
      return (
        <input
          type="text"
          disabled={disabled}
          placeholder={config.placeholder || `Enter ${field.label.toLowerCase()}...`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={commonInputClass}
        />
      );

    case 'LONG_TEXT':
      return (
        <textarea
          rows={3}
          disabled={disabled}
          placeholder={config.placeholder || `Enter ${field.label.toLowerCase()}...`}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={commonInputClass}
        />
      );

    case 'NUMBER':
      return (
        <div className="relative">
          <Hash className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="number"
            disabled={disabled}
            min={config.min}
            max={config.max}
            placeholder={config.placeholder || '0'}
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              handleChange(v === '' ? null : Number(v));
            }}
            className={`${commonInputClass} pl-8`}
          />
        </div>
      );

    case 'DATE':
      return (
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="date"
            disabled={disabled}
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`${commonInputClass} pl-8`}
          />
        </div>
      );

    case 'URL':
      return (
        <div className="relative">
          <Globe className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="url"
            disabled={disabled}
            placeholder="https://..."
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`${commonInputClass} pl-8`}
          />
        </div>
      );

    case 'EMAIL':
      return (
        <div className="relative">
          <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="email"
            disabled={disabled}
            placeholder="name@company.com"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`${commonInputClass} pl-8`}
          />
        </div>
      );

    case 'BOOLEAN':
      return (
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(value)}
            onChange={(e) => handleChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-xs text-slate-600">Yes / Enabled</span>
        </label>
      );

    case 'SINGLE_SELECT':
      const options = config.options || [];
      return (
        <select
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`${commonInputClass} bg-white`}
        >
          <option value="">Select an option...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'MULTI_SELECT':
      const multiOptions = config.options || [];
      const currentSelected: string[] = Array.isArray(value) ? value : [];

      const toggleOption = (opt: string) => {
        if (currentSelected.includes(opt)) {
          handleChange(currentSelected.filter((item) => item !== opt));
        } else {
          handleChange([...currentSelected, opt]);
        }
      };

      return (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {multiOptions.map((opt) => {
            const isSelected = currentSelected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                disabled={disabled}
                onClick={() => toggleOption(opt)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected && <CheckSquare className="h-3 w-3" />}
                {opt}
              </button>
            );
          })}
        </div>
      );

    default:
      return (
        <input
          type="text"
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={commonInputClass}
        />
      );
  }
}
