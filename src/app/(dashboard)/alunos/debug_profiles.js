import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAll() {
  console.log('Iniciando checagem de perfis...')
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status')

  if (error) {
    console.error('Erro:', error)
  } else {
    console.log('Perfis encontrados no banco:')
    console.table(data)
  }
}

checkAll()
