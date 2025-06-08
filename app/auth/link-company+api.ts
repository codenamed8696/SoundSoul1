import { 
  validateSession, 
  linkCompanyToUser 
} from '@/utils/authStore';

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
    const { companyToken } = body;

    if (!companyToken) {
      return new Response(
        JSON.stringify({ error: 'Company token is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Link company to user
    const success = linkCompanyToUser(user.id, companyToken);
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Invalid company token' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get updated user data
    const updatedUser = validateSession(token);
    
    return new Response(
      JSON.stringify({ 
        user: updatedUser,
        success: true,
        message: 'Company benefits linked successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Link company error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}