import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('/Users/chetan/Investment-Tracker/portfolio-frontend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

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
        if (error.message.includes('already registered')) {
            console.log('User already exists. You can use these credentials.');
        }
    } else {
        console.log('User created successfully!');
        console.log('Note: If email confirmation is enabled, you may need to click the link in your email or disable it in Supabase dashboard.');
    }
}

createDemoUser();
