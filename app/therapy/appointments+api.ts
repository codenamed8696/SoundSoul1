import { 
  validateSession, 
  createAppointment, 
  findAppointmentById, 
  updateAppointment, 
  getAppointmentsByUserId, 
  getAppointmentsByCounselorId,
  getAllAppointments,
  findCounselorById
} from '@/utils/authStore';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.substring(7);
    const user = validateSession(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const appointmentId = url.searchParams.get('id');

    if (appointmentId) {
      // Get specific appointment
      const appointment = findAppointmentById(appointmentId);
      if (!appointment) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Check permissions
      if (user.role === 'user' && appointment.userId !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      if (user.role === 'counselor' && appointment.counselorId !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          appointment,
          success: true 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Get appointments based on user role
      let appointments = [];
      
      switch (user.role) {
        case 'user':
          appointments = getAppointmentsByUserId(user.id);
          break;
        case 'counselor':
          appointments = getAppointmentsByCounselorId(user.id);
          break;
        case 'admin':
          appointments = getAllAppointments();
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid user role' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
      }
      
      return new Response(
        JSON.stringify({ 
          appointments,
          total: appointments.length,
          success: true 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Get appointments error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.substring(7);
    const user = validateSession(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    const { counselorId, scheduledDate, duration, type, notes } = body;

    // Validate required fields
    if (!counselorId || !scheduledDate || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: counselorId, scheduledDate, type' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate counselor exists
    const counselor = findCounselorById(counselorId);
    if (!counselor) {
      return new Response(
        JSON.stringify({ error: 'Counselor not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate appointment type
    if (!['video', 'audio', 'chat'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid appointment type' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create meeting link for video/audio sessions
    const meetingLink = type !== 'chat' 
      ? `https://meet.wellness.app/room/${Date.now()}` 
      : undefined;

    // Create appointment
    const appointment = createAppointment({
      userId: user.id,
      counselorId,
      userAnonymousId: user.anonymousId,
      scheduledDate,
      duration: duration || 60,
      type,
      status: 'pending',
      notes,
      meetingLink
    });
    
    return new Response(
      JSON.stringify({ 
        appointment,
        success: true,
        message: 'Appointment booked successfully' 
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Create appointment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.substring(7);
    const user = validateSession(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Appointment ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the appointment
    const appointment = findAppointmentById(id);
    if (!appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permissions
    const canUpdate = user.role === 'admin' || 
                     (user.role === 'counselor' && appointment.counselorId === user.id) ||
                     (user.role === 'user' && appointment.userId === user.id);

    if (!canUpdate) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate status if being updated
    if (updates.status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(updates.status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid appointment status' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update appointment
    const updatedAppointment = updateAppointment(id, updates);
    
    if (!updatedAppointment) {
      return new Response(
        JSON.stringify({ error: 'Failed to update appointment' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        appointment: updatedAppointment,
        success: true,
        message: 'Appointment updated successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Update appointment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}