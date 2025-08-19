import { notFound } from 'next/navigation'
import { supabase } from '@root/lib/supabase'
import LetterViewer from '@components/LetterViewer'

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const { data: letter, error } = await supabase
    .from('letters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !letter) {
    notFound()
  }

  return <LetterViewer letter={letter} />
}