import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@root/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { content, recipient_email, recipient_name, sender_name, return_address } = await request.json()

    if (!content || !recipient_email || !recipient_name) {
      return NextResponse.json(
        { error: 'Content, recipient email, and recipient name are required' },
        { status: 400 }
      )
    }

    // Save letter to database
    const { data: letter, error: dbError } = await supabase
      .from('letters')
      .insert([
        {
          content,
          recipient_email,
          recipient_name,
          sender_name: sender_name || null,
          return_address: return_address || null
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save letter' },
        { status: 500 }
      )
    }

    // Get the base URL for the letter link
    const baseUrl = request.headers.get('origin') || 'http://localhost:10000'
    const letterUrl = `${baseUrl}/letter/${letter.id}`

    // Send email notification
    const { error: emailError } = await resend.emails.send({
      from: 'letters@rohankalia.dev',
      to: [recipient_email],
      subject: 'Someone sent you a letter',
      html: `
        <div style="font-family: 'Courier New', monospace; color: #161616; padding: 20px;">
          <p>Someone sent you a letter.</p>
          <p>Open it at: <a href="${letterUrl}" style="color: #161616;">${letterUrl}</a></p>
        </div>
      `
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      letterId: letter.id 
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}