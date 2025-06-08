import { 
  createAnonymousUser, 
  createSession 
} from '@/utils/authStore';

export async function POST(request: Request) {
  try {
    // Create anonymous user
    const user = createAnonymousUser();
    const token = createSession(user.id);

    // Return user data
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
    console.error('Anonymous login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}