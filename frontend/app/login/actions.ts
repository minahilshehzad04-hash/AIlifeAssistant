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

import { headers } from 'next/headers'

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()
  
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  
  let redirectUrl = `${protocol}://${host}/auth/callback`
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  }

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

