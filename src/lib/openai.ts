import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLandingPageContent(idea: string): Promise<{
  headline: string;
  pitch: string;
  cta: string;
  features: string[];
  industry: string;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter and startup advisor. Generate compelling landing page content for startup ideas. 
          Create content that would make people want to sign up for early access or updates about this product.
          Focus on the problem being solved, the solution, and create urgency around getting early access.
          
          IMPORTANT: The headline should be punchy and specific to the idea. The pitch should be a brief, compelling description that complements the headline without repeating it. Keep the pitch concise and focused on the value proposition.
          
          Also identify the industry category for the startup idea. Choose from: Technology, Healthcare, Finance, Education, E-commerce, SaaS, AI/ML, Mobile Apps, Gaming, Real Estate, Food & Beverage, Transportation, Energy, Entertainment, or Other.`
        },
        {
          role: "user",
          content: `Create landing page content for this startup idea: "${idea}"
          
          Please provide:
          1. A compelling headline (max 60 characters) - be specific and punchy
          2. A brief pitch paragraph (1-2 sentences) - describe the value proposition without repeating the headline
          3. A call-to-action button text (max 20 characters)
          4. 3-4 key features/benefits (short phrases)
          5. The industry category (choose from: Technology, Healthcare, Finance, Education, E-commerce, SaaS, AI/ML, Mobile Apps, Gaming, Real Estate, Food & Beverage, Transportation, Energy, Entertainment, or Other)
          
          The pitch should be something like "Join thousands of early adopters who are already excited about this innovation" or similar, not a repeat of the headline.
          
          Format as JSON with keys: headline, pitch, cta, features, industry`
        }
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Clean the content and try to extract JSON
    let cleanedContent = content.trim();
    
    // Try to find JSON within the response if it's wrapped in markdown
    const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[1];
    }
    
    // If it doesn't start with {, try to find the JSON object
    if (!cleanedContent.startsWith('{')) {
      const jsonStart = cleanedContent.indexOf('{');
      if (jsonStart !== -1) {
        cleanedContent = cleanedContent.substring(jsonStart);
      }
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content received:', content);
      throw new Error('Invalid JSON response from AI');
    }
    return {
      headline: parsed.headline || `Revolutionary ${idea}`,
      pitch: parsed.pitch || `We're building the future of ${idea}. Join thousands of early adopters who are already excited about this innovation.`,
      cta: parsed.cta || 'Get Early Access',
      features: parsed.features || ['Innovative solution', 'Easy to use', 'Game-changing results'],
      industry: parsed.industry || 'Technology'
    };
  } catch (error) {
    console.error('Error generating content:', error);
    // Fallback content
    return {
      headline: `Revolutionary ${idea}`,
      pitch: `We're building the future of ${idea}. Join thousands of early adopters who are already excited about this innovation.`,
      cta: 'Get Early Access',
      features: ['Innovative solution', 'Easy to use', 'Game-changing results'],
      industry: 'Technology'
    };
  }
}
