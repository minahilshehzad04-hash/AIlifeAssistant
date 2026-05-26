'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()
  // Assuming the app runs on localhost:3000 locally. In production, use env var.
  let siteUrl = 'http://localhost:3000'
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  } else if (process.env.VERCEL_URL) {
    siteUrl = `https://${process.env.VERCEL_URL}`
  }
  const redirectUrl = `${siteUrl}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    redirect('/login?message=Could not authenticate user with ' + provider)
  }

  if (data.url) {
    redirect(data.url) // Redirect to the OAuth provider's sign-in page
  }
}

