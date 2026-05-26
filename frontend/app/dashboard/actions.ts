'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- RAG INGESTION HELPER ---
async function ingestToRAG(userId: string, textContent: string, sourceType: string, sourceId: string) {
  try {
    await fetch('http://127.0.0.1:8000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        text_content: textContent,
        source_type: sourceType,
        source_id: sourceId
      })
    })
  } catch (err) {
    console.error('Failed to ingest to RAG:', err)
  }
}

// --- TASKS ---

export async function getTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching tasks:', error?.message || error)
  return data || []
}

export async function addTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  if (!title) return

  const { data, error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title,
    status: 'pending',
    metadata: { priority: 'medium' }
  }).select().single()

  if (error) throw new Error(error.message)

  if (data) {
    await ingestToRAG(user.id, `Task: ${title}`, 'task', data.id)
  }

  revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

// --- NOTES ---

export async function getNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching notes:', error?.message || error)
  return data || []
}

export async function addNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string || 'General'

  if (!content) return

  const { data, error } = await supabase.from('notes').insert({
    user_id: user.id,
    title,
    content,
    category
  }).select().single()

  if (error) throw new Error(error.message)

  if (data) {
    const fullText = title ? `${title}\n${content}` : content;
    await ingestToRAG(user.id, `Note (${category}): ${fullText}`, 'note', data.id)
  }

  revalidatePath('/dashboard')
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

// --- AI ANALYTICS ---

export async function getDailyBrief() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ['Review your pending tasks.', 'Organize your notes.']

  try {
    const response = await fetch('http://127.0.0.1:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        context_type: 'daily'
      }),
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.suggestions || []
    }
  } catch (err) {
    console.error('Failed to get daily brief from AI:', err)
  }

  return ['Check your pending tasks.', 'Take a moment to review your recent notes.']
}

// --- AI CHAT ---

export async function sendChatMessage(message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  try {
    const response = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        message: message
      }),
      cache: 'no-store'
    })
    
    if (response.ok) {
      return await response.json()
    }
    throw new Error("Backend returned an error")
  } catch (err) {
    console.error('Failed to send chat message:', err)
    return {
      response: "Sorry, I am currently disconnected from my brain.",
      extracted_tasks: [],
      extracted_reminders: []
    }
  }
}

export async function getChatHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat history:', error.message)
    return []
  }

  return data.map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    extractedTasks: msg.extracted_data?.tasks || [],
    extractedReminders: msg.extracted_data?.reminders || []
  }))
}