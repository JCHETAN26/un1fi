const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic .env parser
const envPath = '/Users/chetan/Investment-Tracker/portfolio-frontend/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

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
        if (error.message.includes('already registered')) {
            console.log('User already exists. You can use these credentials.');
        } else {
            console.error('Error signing up:', error.message);
        }
    } else {
        console.log('User created successfully!');
    }
}

createDemoUser();
