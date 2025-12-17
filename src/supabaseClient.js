import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcdcnhoysisufabybunm.supabase.co'  // THAY BẰNG URL CỦA BẠN
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZGNuaG95c2lzdWZhYnlidW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzgwMzUsImV4cCI6MjA4MTUxNDAzNX0.o1w8gxNOMA0yNwhwIdtf2qsGl7pDB4FkbjOVqiY0kHw'                 // THAY BẰNG ANON KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)