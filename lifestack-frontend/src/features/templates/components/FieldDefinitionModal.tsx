import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sliders, AlertCircle } from 'lucide-react';
import {
  FieldDefinition,
  FieldType,
  CreateFieldDefinitionPayload,
  UpdateFieldDefinitionPayload,
} from '../../../lib/api';
import { parseFieldConfig } from './DynamicFormRenderer';

export interface FieldDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateFieldDefinitionPayload | UpdateFieldDefinitionPayload) => Promise<void>;
  initialData?: FieldDefinition | null;
}

const FIELD_TYPES: { label: string; value: FieldType; description: string }[] = [
  { label: 'Short Text', value: 'TEXT', description: 'Single line text input' },
  { label: 'Long Text', value: 'LONG_TEXT', description: 'Multi-line notes or statements' },
  { label: 'Number', value: 'NUMBER', description: 'Numeric values with optional min/max' },
  { label: 'Date', value: 'DATE', description: 'Calendar date picker (YYYY-MM-DD)' },
  { label: 'Website URL', value: 'URL', description: 'Link to portfolio, repo, or job post' },
  { label: 'Email', value: 'EMAIL', description: 'Recruiter or hiring manager email' },
  { label: 'Boolean / Checkbox', value: 'BOOLEAN', description: 'Yes/No binary checkbox' },
  { label: 'Single Select', value: 'SINGLE_SELECT', description: 'Dropdown single choice option' },
  { label: 'Multi Select', value: 'MULTI_SELECT', description: 'Multiple selectable tags' },
];

function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export const FieldDefinitionModal: React.FC<FieldDefinitionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [label, setLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('TEXT');
  const [required, setRequired] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [minVal, setMinVal] = useState<string>('');
  const [maxVal, setMaxVal] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '');
      setFieldKey(initialData.fieldKey || '');
      setFieldType(initialData.fieldType || 'TEXT');
      setRequired(Boolean(initialData.required));

      const cfg = parseFieldConfig(initialData.config);
      setPlaceholder(cfg.placeholder || '');
      setMinVal(cfg.min !== undefined ? String(cfg.min) : '');
      setMaxVal(cfg.max !== undefined ? String(cfg.max) : '');
      setOptions(cfg.options || []);
    } else {
      setLabel('');
      setFieldKey('');
      setFieldType('TEXT');
      setRequired(false);
      setPlaceholder('');
      setMinVal('');
      setMaxVal('');
      setOptions([]);
    }
    setNewOptionInput('');
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!isEditing) {
      setFieldKey(toSnakeCase(val));
    }
  };

  const addOption = () => {
    const trimmed = newOptionInput.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setNewOptionInput('');
    }
  };

  const removeOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setErrorMsg('Field label is required.');
      return;
    }
    if (!isEditing && !fieldKey.trim()) {
      setErrorMsg('Field key is required.');
      return;
    }

    if ((fieldType === 'SINGLE_SELECT' || fieldType === 'MULTI_SELECT') && options.length === 0) {
      setErrorMsg('Please configure at least one option for select fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const configObj: any = {};
      if (placeholder.trim()) configObj.placeholder = placeholder.trim();
      if (fieldType === 'NUMBER') {
        if (minVal !== '') configObj.min = Number(minVal);
        if (maxVal !== '') configObj.max = Number(maxVal);
      }
      if (fieldType === 'SINGLE_SELECT' || fieldType === 'MULTI_SELECT') {
        configObj.options = options;
      }

      const configJson = JSON.stringify(configObj);

      if (isEditing) {
        const payload: UpdateFieldDefinitionPayload = {
          label: label.trim(),
          fieldType,
          required,
          config: configJson,
        };
        await onSubmit(payload);
      } else {
        const payload: CreateFieldDefinitionPayload = {
          fieldKey: fieldKey.trim().toLowerCase(),
          label: label.trim(),
          fieldType,
          required,
          config: configJson,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save field definition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Field Definition' : 'Add Custom Field'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure attribute label, data type, and validation constraints.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Display Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Recruiter Email, Referral Bonus, Company Tier"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Field Key (Stable Identifier) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              placeholder="e.g. recruiter_email, company_tier"
              value={fieldKey}
              onChange={(e) => setFieldKey(toSnakeCase(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 font-mono text-xs placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Immutable lowercase identifier used in JSON payloads.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Data Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as FieldType)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Options Builder for Select fields */}
          {(fieldType === 'SINGLE_SELECT' || fieldType === 'MULTI_SELECT') && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Dropdown Options <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter option title..."
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>

              {options.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No options added yet.</p>
              )}
            </div>
          )}

          {/* Conditional Bounds for Number fields */}
          {fieldType === 'NUMBER' && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Minimum Value</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Maximum Value</label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Placeholder input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Placeholder Text</label>
            <input
              type="text"
              placeholder="e.g. Enter bonus in USD..."
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Required checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Mark as Mandatory / Required Field
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Field' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
