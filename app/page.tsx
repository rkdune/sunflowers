import { Suspense } from 'react'
import LetterComposer from '@components/LetterComposer'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LetterComposer />
    </Suspense>
  )
}