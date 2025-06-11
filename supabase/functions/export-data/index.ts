// In supabase/functions/export-data/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('User not found')

    const { data: profile } = await supabaseClient.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile?.organization_id) throw new Error('Organization not found for user.')
    const orgId = profile.organization_id;

    // --- Generate CSV Data ---
    const { data: users } = await supabaseClient.from('profiles').select('id').eq('organization_id', orgId);
    const userIds = users.map(u => u.id);
    const { data: moodData } = await supabaseClient.from('mood_entries').select('mood_score').in('user_id', userIds);
    const totalMoodEntries = moodData?.length || 0;
    const averageMoodScore = totalMoodEntries > 0 ? moodData.reduce((acc, curr) => acc + curr.mood_score, 0) / totalMoodEntries : 0;
    const { count: totalAppointments } = await supabaseClient.from('appointments').select('*', { count: 'exact', head: true }).in('user_id', userIds);
    
    let csv = 'Metric,Value\n';
    csv += `Total Enrolled Employees,${userIds.length}\n`;
    csv += `Total Mood Entries Logged,${totalMoodEntries}\n`;
    csv += `Average Mood Score (out of 5),${averageMoodScore.toFixed(2)}\n`;
    csv += `Total Therapy Sessions Booked,${totalAppointments || 0}\n`;

    // --- Upload CSV to Supabase Storage ---
    const reportType = "On-Demand Summary";
    const fileName = `${reportType.replace(' ', '-')}_${new Date().toISOString()}.csv`;
    const filePath = `${orgId}/${fileName}`;
    
    const { error: uploadError } = await supabaseClient.storage
      .from('generated-reports')
      .upload(filePath, csv, { contentType: 'text/csv' });
    if (uploadError) throw uploadError;

    // --- Create a record in the database table ---
    const fileSizeKB = (new TextEncoder().encode(csv).length) / 1024;
    const { error: insertError } = await supabaseClient
      .from('generated_reports')
      .insert({
        organization_id: orgId,
        report_type: reportType,
        file_path: filePath,
        file_size_kb: fileSizeKB.toFixed(2),
      });
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, message: "Report generated successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})