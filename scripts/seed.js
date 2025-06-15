// FINAL SCRIPT - This version REMOVES the cleanup function and assumes a manually purged database.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// --- CONFIGURATION ---
const NUM_ORGANIZATIONS = 15;
const NUM_COUNSELORS = 7;
const NUM_USERS = 100;
// ---------------------

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Key is missing. Make sure your .env file is in the root directory and contains the correct keys.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('\n--- Starting new data seeding on a clean database---');

  // 1. Create Organizations
  console.log(`\nCreating ${NUM_ORGANIZATIONS} organizations...`);
  const organizations = Array.from({ length: NUM_ORGANIZATIONS }, () => ({
    name: faker.company.name(),
    industry: faker.company.buzzNoun(),
  }));
  const { data: createdOrganizations, error: orgError } = await supabaseAdmin.from('organizations').insert(organizations).select();
  if (orgError) throw new Error(`Error creating organizations: ${orgError.message}`);
  console.log(`Successfully created ${createdOrganizations.length} organizations.`);

  // 2. Create Counselors
  console.log(`\nCreating ${NUM_COUNSELORS} counselors...`);
  const counselorSpecs = ['CBT', 'DBT', 'Trauma-Informed', 'Grief Counseling', 'Addiction', 'Anxiety'];
  let createdCounselors = [];
  for (let i = 0; i < NUM_COUNSELORS; i++) {
    const email = `counselor${i}@example.com`;
    // Create the user in the auth system first
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.createUser({ email, password: 'password', email_confirm: true });
    if (authError) throw new Error(`Could not create counselor auth user: ${authError.message}`);
    
    // Next, UPDATE the profile that was automatically created by the trigger
    const { data: updatedProfile, error: profileError } = await supabaseAdmin.from('profiles').update({
        full_name: faker.person.fullName(),
        role: 'counselor',
        avatar_url: faker.image.avatar()
    }).eq('id', authUser.id).select().single();
    if (profileError) throw new Error(`Could not UPDATE counselor profile: ${profileError.message}`);

    // Finally, create the counselor-specific record
    const { data: newCounselor, error: counselorError } = await supabaseAdmin.from('counselors').insert({
        profile_id: updatedProfile.id,
        bio: faker.person.bio(),
        specialties: faker.helpers.arrayElements(counselorSpecs, 2),
        status: 'active' 
    }).select().single();
    if (counselorError) throw new Error(`Could not create counselor record: ${counselorError.message}`);
    createdCounselors.push(newCounselor);
  }
  console.log(`Successfully created ${createdCounselors.length} counselors.`);

  // 3. Create Users
  console.log(`\nCreating ${NUM_USERS} users...`);
  let createdProfiles = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const email = `user${i}@example.com`;
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.createUser({ email, password: 'password', email_confirm: true });
    if (authError) { console.warn(`Skipping user ${email}: ${authError.message}`); continue; }

    const { data: updatedProfile, error: profileError } = await supabaseAdmin.from('profiles').update({
      full_name: faker.person.fullName(),
      role: 'user',
      avatar_url: faker.image.avatar(),
      organization_id: faker.helpers.arrayElement(createdOrganizations).id,
      counselor_id: faker.helpers.arrayElement(createdCounselors).id,
    }).eq('id', authUser.id).select().single();
    if (profileError) throw new Error(`Could not UPDATE user profile for ${email}: ${profileError.message}`);
    createdProfiles.push(updatedProfile);
  }
  console.log(`Successfully created ${createdProfiles.length} users.`);
  
  // 4. Create Mood Entries & Appointments
  console.log('\nCreating mood entries and appointments...');
  const moodEntries = [];
  const appointments = [];
  for (const profile of createdProfiles) {
    for (let i = 0; i < 15; i++) {
        moodEntries.push({ user_id: profile.id, mood_score: faker.number.int({ min: 1, max: 5 }), created_at: faker.date.recent({ days: 90 }) });
    }
    if (faker.datatype.boolean(0.5)) {
        appointments.push({ user_id: profile.id, counselor_id: profile.counselor_id, appointment_time: faker.date.soon({ days: 30 }), type: 'video', status: 'scheduled' });
    }
  }
  await supabaseAdmin.from('mood_entries').insert(moodEntries);
  await supabaseAdmin.from('appointments').insert(appointments);
  console.log(`Successfully created ${moodEntries.length} mood entries and ${appointments.length} appointments.`);

  console.log('\n--- Seeding script finished successfully! ---');
  console.log('You can now log in with users like user0@example.com / password');
}

main().catch(error => {
    console.error("\nAN ERROR OCCURRED DURING SEEDING:");
    console.error(error);
    process.exit(1);
});