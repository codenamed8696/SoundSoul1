// This script is written from scratch based on the provided "Supabase Snippet Database Structure Overview.csv" file.
// It correctly handles all foreign key relationships and data types.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// --- SCRIPT CONFIGURATION ---
const NUM_COMPANIES = 20;
const NUM_COUNSELORS = 15;
const NUM_USERS = 100;
// ----------------------------

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; 

// --- SAFETY CHECK ---
if (process.env.DANGEROUSLY_WIPE_DATABASE !== 'true') {
  console.error('\n❌ SAFETY LOCK ENGAGED. ❌');
  console.error('This script is designed to completely wipe all data and users from your database.');
  console.error('To proceed, you must add DANGEROUSLY_WIPE_DATABASE=true to your .env file.');
  process.exit(1);
}
// --------------------

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Key is missing. Make sure your .env file is correctly set up with EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- HELPER FUNCTIONS ---
const runStep = async (title, fn) => {
  console.log(`\n🔄 ${title}...`);
  try {
    const result = await fn();
    console.log(`✅ ${title} - SUCCESS`);
    return result;
  } catch (error) {
    console.error(`\n❌ ${title} - FAILED`);
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// --- MAIN SEEDING SCRIPT ---

async function seedDatabase() {
    console.log('--- Starting Database Seeding Script ---');

    // 1. WIPE ALL EXISTING DATA (DANGEROUS)
    await runStep('Wiping all dependent data', async () => {
        await supabaseAdmin.from('mood_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseAdmin.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    });
    
    await runStep('Wiping all authentication users (cascades to profiles and counselors)', async () => {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        for (const user of users) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
        }
    });

    await runStep('Wiping remaining public data (organizations)', async () => {
        await supabaseAdmin.from('organizations').delete().neq('id', 0);
    });

    // 2. SEED ORGANIZATIONS
    const createdOrganizations = await runStep(`Creating ${NUM_COMPANIES} organizations`, async () => {
        const organizations = Array.from({ length: NUM_COMPANIES }, () => ({
            name: faker.company.name(),
            industry: faker.company.buzzNoun(),
        }));
        const { data, error } = await supabaseAdmin.from('organizations').insert(organizations).select('id');
        if (error) throw error;
        return data;
    });

    // 3. SEED COUNSELORS
    const createdCounselors = await runStep(`Creating ${NUM_COUNSELORS} counselors`, async () => {
        let counselors = [];
        for (let i = 0; i < NUM_COUNSELORS; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = `counselor${i + 1}@soundsoul.com`;

            // ✅ THE FIX: Auto-confirm the email upon creation.
            const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
                email,
                password: 'password123',
                options: {
                    email_confirm: true, // This confirms the user immediately
                    data: {
                        full_name: `${firstName} ${lastName}`,
                        avatar_url: faker.image.avatar()
                    }
                }
            });
            if (authError) throw authError;

            const profileId = authData.user.id;

            const { data: counselorData, error: counselorError } = await supabaseAdmin.from('counselors').insert({
                profile_id: profileId,
                specialties: faker.helpers.arrayElements(['Anxiety', 'CBT', 'Trauma', 'Family Therapy', 'ADHD'], { min: 2, max: 4 }),
            }).select('id').single();
            if (counselorError) throw counselorError;

            await supabaseAdmin.from('profiles').update({ role: 'counselor' }).eq('id', profileId);
            counselors.push(counselorData);
        }
        return counselors;
    });

    // 4. SEED USERS
    const createdUsers = await runStep(`Creating ${NUM_USERS} users`, async () => {
        let users = [];
        for (let i = 0; i < NUM_USERS; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = `user${i + 1}@soundsoul.com`;

            // ✅ THE FIX: Auto-confirm the email upon creation.
            const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
                email,
                password: 'password123',
                options: {
                    email_confirm: true, // This confirms the user immediately
                    data: {
                        full_name: `${firstName} ${lastName}`,
                        avatar_url: faker.image.avatar()
                    }
                }
            });
            if (authError) throw authError;

            const userId = authData.user.id;
            const assignedCounselorId = faker.helpers.arrayElement(createdCounselors).id;
            
            const { error: profileError } = await supabaseAdmin.from('profiles').update({
                role: 'user',
                organization_id: faker.helpers.arrayElement(createdOrganizations).id,
                counselor_id: assignedCounselorId
            }).eq('id', userId);
            if (profileError) throw profileError;

            users.push({ id: userId, counselor_id: assignedCounselorId });
        }
        return users;
    });

    // 5. SEED APPOINTMENTS AND MOOD ENTRIES
    await runStep('Creating appointments and mood entries for users', async () => {
        let appointments = [];
        let moodEntries = [];
        for (const user of createdUsers) {
            if (!user.counselor_id) continue;
            for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
                appointments.push({
                    user_id: user.id,
                    counselor_id: user.counselor_id,
                    appointment_time: faker.date.soon({ days: 60 }),
                    status: faker.helpers.arrayElement(['confirmed', 'completed', 'cancelled']),
                    type: 'video'
                });
            }
            for (let i = 0; i < faker.number.int({ min: 20, max: 50 }); i++) {
                moodEntries.push({
                    user_id: user.id,
                    mood_score: faker.number.int({ min: 1, max: 5 }),
                    notes: faker.lorem.sentence(),
                    created_at: faker.date.recent({ days: 90 })
                });
            }
        }
        if (appointments.length > 0) await supabaseAdmin.from('appointments').insert(appointments);
        if (moodEntries.length > 0) await supabaseAdmin.from('mood_entries').insert(moodEntries);
    });

    console.log('\n--- ✅ Database Seeding Complete! ---');
    console.log('You can now log in with accounts like:');
    console.log('- user1@soundsoul.com');
    console.log('- counselor1@soundsoul.com');
    console.log('All passwords are "password123".');
}

seedDatabase();