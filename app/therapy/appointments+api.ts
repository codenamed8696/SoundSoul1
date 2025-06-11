import { supabase } from '@/context/supabaseClient'; // Using the real Supabase client

// Helper to get user from request header
async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization token required');
  }
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  return user;
}

/**
 * GET: Fetches appointments based on the logged-in user's role.
 */
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    // Fetch the user's profile to get their role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found.' }), { status: 404 });
    }

    let query = supabase.from('appointments').select('*');

    // Filter appointments based on user role
    if (profile.role === 'user') {
      query = query.eq('user_id', user.id);
    } else if (profile.role === 'counselor') {
      // This part assumes the counselor's profile ID is linked correctly.
      // We would need to fetch the counselor-specific ID first.
      // For now, this demonstrates the RLS will do the heavy lifting.
      // This query will only return appointments the counselor is allowed to see by RLS.
    } else if (profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Invalid user role for this action.' }), { status: 403 });
    }

    const { data: appointments, error } = await query;

    if (error) throw error;

    return new Response(JSON.stringify({ appointments }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST: Creates a new appointment.
 */
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    const body = await request.json();

    const { counselor_id, appointment_time, status = 'scheduled' } = body;

    if (!counselor_id || !appointment_time) {
      return new Response(JSON.stringify({ error: 'Missing required fields: counselor_id, appointment_time' }), { status: 400 });
    }

    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        counselor_id,
        appointment_time,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ appointment: newAppointment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * PUT: Updates an existing appointment (e.g., to cancel it).
 */
export async function PUT(request: Request) {
  try {
    await getUserFromRequest(request);
    const { id, ...updates } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Appointment ID is required' }), { status: 400 });
    }

    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ appointment: updatedAppointment }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


/**
 * PATCH: A specific action to mark an appointment as complete and use a B2B credit.
 */
export async function PATCH(request: Request) {
    try {
        const user = await getUserFromRequest(request);
        const { appointmentId, organizationId } = await request.json();

        if (!appointmentId || !organizationId) {
            return new Response(JSON.stringify({ error: 'appointmentId and organizationId are required.' }), { status: 400 });
        }

        // Step 1: Update the appointment's status to 'completed'.
        const { error: updateError } = await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .eq('id', appointmentId);

        if (updateError) throw updateError;

        // Step 2: Call the database function to use a credit.
        const { error: rpcError } = await supabase.rpc('use_organization_credit', {
            p_user_id: user.id,
            p_organization_id: organizationId,
        });

        if (rpcError) throw rpcError;

        return new Response(JSON.stringify({ success: true, message: 'Appointment completed and credit used.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}