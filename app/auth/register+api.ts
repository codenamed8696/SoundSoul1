import { 
  createUser, 
  findUserByEmail, 
  createSession 
} from '@/utils/authStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User already exists with this email' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create new user
    const user = createUser(email, password, name);
    const token = createSession(user.id);

    // Return user data without sensitive information
    const { ...userData } = user;
    
    return new Response(
      JSON.stringify({ 
        user: userData, 
        token,
        success: true 
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}