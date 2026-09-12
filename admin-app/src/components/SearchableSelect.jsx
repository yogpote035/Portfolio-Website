import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from './ui.jsx';

function SearchableSelect({ options, value, onChange, multiple = false, placeholder = 'Select an option', searchPlaceholder = 'Search options...', ariaLabel, required = false, invalid = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();
  const selectedValues = multiple ? (value || []).map(String) : [String(value ?? '')];
  const selectedOptions = options.filter((option) => selectedValues.includes(String(option.value)));
  const filteredOptions = useMemo(() => options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase())), [options, query]);

  useEffect(() => {
    const close = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
    else setQuery('');
  }, [open]);

  const select = (optionValue) => {
    const normalized = String(optionValue);
    if (multiple) {
      const next = selectedValues.includes(normalized) ? selectedValues.filter((item) => item !== normalized) : [...selectedValues, normalized];
      onChange(next);
    } else {
      onChange(normalized);
      setOpen(false);
    }
  };

  return <div className={`cms-select${open ? ' is-open' : ''}`} ref={rootRef} onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}>
    <button className="cms-select-trigger" type="button" aria-label={ariaLabel} aria-required={required || undefined} aria-invalid={invalid || undefined} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((current) => !current)}>
      <span className={selectedOptions.length ? '' : 'cms-select-placeholder'}>{multiple ? (selectedOptions.length ? `${selectedOptions.length} selected` : placeholder) : (selectedOptions[0]?.label || placeholder)}</span>
      <Icon name="chevron" size={16} />
    </button>
    {multiple && selectedOptions.length > 0 && <div className="cms-select-chips">{selectedOptions.map((option) => <button type="button" key={option.value} onClick={() => select(option.value)}>{option.label}<span aria-hidden="true">×</span></button>)}</div>}
    {open && <div className="cms-select-popover">
      <label className="cms-select-search"><Icon name="search" size={16} /><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={`Search ${ariaLabel || 'options'}`} /></label>
      <div className="cms-select-options" id={listId} role="listbox" aria-multiselectable={multiple || undefined}>
        {filteredOptions.length ? filteredOptions.map((option) => { const selected = selectedValues.includes(String(option.value)); return <button className={selected ? 'is-selected' : ''} type="button" role="option" aria-selected={selected} key={option.value} onClick={() => select(option.value)}><span>{option.label}</span>{selected && <span aria-hidden="true">✓</span>}</button>; }) : <p>No matching options</p>}
      </div>
    </div>}
  </div>;
}

export default SearchableSelect;
