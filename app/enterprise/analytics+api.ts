import { 
  validateSession, 
  getCompanyAnalytics 
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

    // Only employers can access company analytics
    if (user.role !== 'employer') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Employer role required.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const companyToken = url.searchParams.get('companyToken');

    if (!companyToken) {
      return new Response(
        JSON.stringify({ error: 'Company token is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate analytics with Privacy-Enhancing Technologies applied
    const analytics = getCompanyAnalytics(companyToken);
    
    return new Response(
      JSON.stringify({ 
        analytics,
        success: true,
        message: 'Analytics generated with privacy protection applied',
        privacyNotice: {
          differentialPrivacy: 'Noise has been added to all numerical values to protect individual privacy',
          kAnonymity: 'Groups with fewer than 5 individuals have been filtered or generalized',
          dataRetention: 'Only aggregated, anonymized data is processed and stored',
          compliance: 'HIPAA and GDPR compliant data processing'
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Get company analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}