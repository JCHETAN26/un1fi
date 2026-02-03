import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Basic .env parser
const envContent = fs.readFileSync('./.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createDemoUser() {
    const email = 'demo@example.com';
    const password = 'Password123!';

    console.log(`Attempting to sign up ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name: 'Demo User' }
        }
    });

    if (error) {
        console.error('Error signing up:', error.message);
    } else {
        console.log('User created successfully!');
    }
}

createDemoUser();
