import { createContext, useContext } from 'react'
import type { ModalName, PageFormName, SubmitHandler } from './types'

interface ModalContextValue {
  openModal: (name: ModalName) => void
  closeModal: () => void
  /** função de envio configurada em App.tsx (ou a simulação, se não houver) */
  getHandler: (name: ModalName | PageFormName) => SubmitHandler
}

export const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
  getHandler: () => () => {},
})

/** Abre qualquer modal registrado: const { openModal } = useModal(); openModal('postar-artigo') */
export const useModal = () => useContext(ModalContext)
