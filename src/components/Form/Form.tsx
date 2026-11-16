import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Icon } from '../Icon/Icon'
import { collectValues, FormErrorsContext, useFieldError, type FormValues } from './formContext'
import styles from './Form.module.css'

/* ============================== Form ============================== */

interface FormProps {
  id?: string
  onSubmit: (values: FormValues) => void
  children: ReactNode
}

/**
 * Usa a validação nativa do navegador (required, maxLength, pattern...),
 * mas mostra as mensagens no padrão visual do site, embaixo de cada campo.
 */
export function Form({ id, onSubmit, children }: FormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const found: Record<string, string> = {}
    let firstInvalid: HTMLElement | null = null

    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (!el.name || !el.willValidate || el.validity.valid) continue
      found[el.name] ??= el.validationMessage
      firstInvalid ??= el
    }

    setErrors(found)
    if (firstInvalid) {
      firstInvalid.focus()
      return
    }
    onSubmit(collectValues(form))
  }

  // ao digitar, some o erro daquele campo
  const clearError = (e: FormEvent<HTMLFormElement>) => {
    const name = (e.target as HTMLInputElement).name
    if (name && errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  return (
    <FormErrorsContext.Provider value={errors}>
      <form id={id} className={styles.form} noValidate onSubmit={handleSubmit} onInput={clearError} onChange={clearError}>
        {children}
      </form>
    </FormErrorsContext.Provider>
  )
}

/* ============================== Field ============================== */

interface FieldProps {
  label: string
  /** nome do campo (para mostrar o erro dele) */
  name: string
  hint?: ReactNode
  required?: boolean
  children: ReactNode
}

export function Field({ label, name, hint, required, children }: FieldProps) {
  const error = useFieldError(name)
  return (
    <label className={`${styles.field} ${error ? styles.invalid : ''}`}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </span>
      {children}
      {error ? (
        <span className={styles.error} role="alert">
          <Icon name="alert" size={14} /> {error}
        </span>
      ) : (
        hint && <span className={styles.hint}>{hint}</span>
      )}
    </label>
  )
}

/** Dois campos lado a lado (vira coluna única no celular) */
export function FormRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}

/* ============================== Inputs ============================== */

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${styles.control} ${props.className ?? ''}`} />
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${styles.control} ${styles.select}`}>
      {children}
    </select>
  )
}

/** Textarea com contador quando houver maxLength */
export function Textarea({ maxLength, onChange, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [length, setLength] = useState(String(props.defaultValue ?? '').length)
  return (
    <span className={styles.textareaWrap}>
      <textarea
        {...props}
        maxLength={maxLength}
        className={`${styles.control} ${styles.textarea}`}
        onChange={(e) => {
          setLength(e.target.value.length)
          onChange?.(e)
        }}
      />
      {maxLength && (
        <span className={styles.counter}>
          {length}/{maxLength}
        </span>
      )}
    </span>
  )
}

/* ============================== Switch ============================== */

interface SwitchProps {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}

export function Switch({ name, label, description, defaultChecked }: SwitchProps) {
  return (
    <label className={styles.switch}>
      <span className={styles.switchText}>
        <span className={styles.switchLabel}>{label}</span>
        {description && <span className={styles.hint}>{description}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className={styles.switchInput} />
      <span className={styles.track} aria-hidden="true" />
    </label>
  )
}

/* ============================== ImageUpload ============================== */

interface ImageUploadProps {
  name: string
  required?: boolean
  /** tamanho máximo em MB */
  maxSizeMb?: number
  /** proporção da área de pré-visualização, ex.: "16 / 9" */
  aspect?: string
}

export function ImageUpload({ name, required, maxSizeMb = 2, aspect = '16 / 6' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // libera a URL temporária da imagem anterior
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleChange = () => {
    const input = inputRef.current
    const file = input?.files?.[0]
    if (!input) return
    if (!file) {
      setPreview(null)
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      input.setCustomValidity(`A imagem deve ter no máximo ${maxSizeMb} MB.`)
    } else if (!file.type.startsWith('image/')) {
      input.setCustomValidity('Envie um arquivo de imagem (PNG, JPG, GIF ou WEBP).')
    } else {
      input.setCustomValidity('')
    }
    setPreview(URL.createObjectURL(file))
  }

  const remove = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.setCustomValidity('')
    }
    setPreview(null)
  }

  return (
    <span className={`${styles.upload} ${preview ? styles.hasPreview : ''}`} style={{ aspectRatio: aspect }}>
      {preview ? (
        <img src={preview} alt="Pré-visualização" className={styles.preview} />
      ) : (
        <span className={styles.uploadHint}>
          <Icon name="image" size={28} />
          <strong>Clique ou arraste uma imagem</strong>
          <span>PNG, JPG, GIF ou WEBP · até {maxSizeMb} MB</span>
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/gif,image/webp"
        required={required}
        onChange={handleChange}
        className={styles.fileInput}
      />
      {preview && (
        <button type="button" className={styles.remove} onClick={remove} aria-label="Remover imagem">
          <Icon name="close" size={16} />
        </button>
      )}
    </span>
  )
}

/* ============================== Opções (enquete) ============================== */

export interface ChoiceOption {
  value: string
  label: string
  description?: string
  image?: string
}

interface ChoiceListProps {
  name: string
  options: ChoiceOption[]
  required?: boolean
}

/** Lista de opções em cards (radio), no estilo dos itens do TOP Eventos */
export function ChoiceList({ name, options, required }: ChoiceListProps) {
  const error = useFieldError(name)
  return (
    <div className={`${styles.choices} ${error ? styles.invalid : ''}`} role="radiogroup">
      {options.map((opt) => (
        <label key={opt.value} className={styles.choice}>
          <input type="radio" name={name} value={opt.value} required={required} className={styles.choiceInput} />
          {opt.image && (
            <span className={styles.choiceImage}>
              <img src={opt.image} alt="" className="pixel" />
            </span>
          )}
          <span className={styles.choiceText}>
            <strong>{opt.label}</strong>
            {opt.description && <span>{opt.description}</span>}
          </span>
          <span className={styles.choiceCheck} aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
        </label>
      ))}
      {error && (
        <span className={styles.error} role="alert">
          <Icon name="alert" size={14} /> Escolha uma opção.
        </span>
      )}
    </div>
  )
}

/* ============================== Aviso ============================== */

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error'; children: ReactNode }) {
  return (
    <div className={`${styles.notice} ${tone === 'error' ? styles.noticeError : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <Icon name="alert" size={16} />
      <div>{children}</div>
    </div>
  )
}
