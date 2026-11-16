import { createContext, useContext } from 'react'

export type FormValues = Record<string, FormDataEntryValue | FormDataEntryValue[]>

export const FormErrorsContext = createContext<Record<string, string>>({})

export const useFieldError = (name?: string) => {
  const errors = useContext(FormErrorsContext)
  return name ? errors[name] : undefined
}

/** Converte o form em objeto. Campos repetidos viram array; arquivo vazio é ignorado. */
export function collectValues(form: HTMLFormElement): FormValues {
  const values: FormValues = {}
  for (const [key, value] of new FormData(form)) {
    if (value instanceof File && value.size === 0) continue
    const current = values[key]
    if (current === undefined) values[key] = value
    else values[key] = Array.isArray(current) ? [...current, value] : [current, value]
  }
  // checkboxes desmarcados não entram no FormData: registra como "off"
  form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]').forEach((cb) => {
    if (!(cb.name in values)) values[cb.name] = 'off'
  })
  return values
}
