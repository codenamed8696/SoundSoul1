import { validateSession } from '@/utils/authStore';

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

    return new Response(
      JSON.stringify({ 
        user,
        success: true 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Get profile error:', error);
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
    const { name, email } = body;

    // Validate input
    if (!name && !email) {
      return new Response(
        JSON.stringify({ error: 'At least one field (name or email) is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare updates
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined && email !== user.email) {
      // Check if new email is already taken
      const { findUserByEmail, updateUser } = await import('@/utils/authStore');
      const existingUser = findUserByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Email already in use by another account' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      updates.email = email;
    }

    // Update user
    const { updateUser } = await import('@/utils/authStore');
    const updatedUser = updateUser(user.id, updates);
    
    if (!updatedUser) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        user: updatedUser,
        success: true,
        message: 'Profile updated successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}