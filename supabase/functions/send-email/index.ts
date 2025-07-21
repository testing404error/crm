import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@3.4.0'

// This function will be deployed to Supabase and will handle sending emails.
// It uses the Resend API key, which is securely stored as an environment variable.

serve(async (req) => {
  // This is needed to handle CORS requests from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*', // In production, you should restrict this to your app's URL
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Get the Resend API key from the environment variables
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)
    const { to, subject, body } = await req.json()

    // Send the email using the Resend SDK
    const { data, error } = await resend.emails.send({
      from: 'CRM App <onboarding@resend.dev>', // IMPORTANT: Replace this with a "from" email you have verified with Resend
      to: [to],
      subject: subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`, // A simple conversion of newlines to HTML breaks
    })

    if (error) {
      console.error({ error })
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
