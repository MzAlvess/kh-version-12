import { createContext, useContext } from 'react'
import type { ModalName } from './types'

interface ModalContextValue {
  openModal: (name: ModalName) => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
})

/** Abre qualquer modal registrado: const { openModal } = useModal(); openModal('postar-artigo') */
export const useModal = () => useContext(ModalContext)
