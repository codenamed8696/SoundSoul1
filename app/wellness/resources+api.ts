import { 
  validateSession, 
  getWellnessResources, 
  getWellnessResourcesByCategory,
  getPopularWellnessResources 
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
    const category = url.searchParams.get('category');
    const popular = url.searchParams.get('popular') === 'true';
    const type = url.searchParams.get('type');
    const difficulty = url.searchParams.get('difficulty');

    let resources = getWellnessResources();

    // Apply filters
    if (popular) {
      resources = getPopularWellnessResources();
    } else if (category) {
      resources = getWellnessResourcesByCategory(category);
    }

    if (type) {
      resources = resources.filter(resource => resource.type === type);
    }

    if (difficulty) {
      resources = resources.filter(resource => resource.difficulty === difficulty);
    }

    // Sort by popularity and creation date
    resources.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return new Response(
      JSON.stringify({ 
        resources,
        total: resources.length,
        success: true 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Get wellness resources error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}