import { notFound } from 'next/navigation'
import { supabase } from '@root/lib/supabase'
import LetterViewer from '@components/LetterViewer'

export default async function LetterPage({ params }: { params: { id: string } }) {
  const { data: letter, error } = await supabase
    .from('letters')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !letter) {
    notFound()
  }

  return <LetterViewer letter={letter} />
}