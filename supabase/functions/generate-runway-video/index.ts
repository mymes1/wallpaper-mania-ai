import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoGenerationRequest {
  taskType: string;
  internal: boolean;
  options: {
    name: string;
    seconds: number;
    text_prompt: string;
    image_prompt?: string;
    watermark: boolean;
    enhance_prompt: boolean;
    resolution: string;
    exploreMode: boolean;
  };
}

interface VideoGenerationResponse {
  id: string;
  status: string;
  progress: number;
  artifacts?: Array<{
    id: string;
    url: string;
    filename: string;
    createdAt: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, orientation } = await req.json();
    const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');

    if (!runwayApiKey) {
      console.error('RUNWAYML_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'RunwayML API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resolution = orientation === 'portrait' ? '768x1344' : '1344x768';
    const baseUrl = 'https://api.dev.runwayml.com/v1';

    // Start video generation
    console.log('Starting video generation with prompt:', prompt, 'orientation:', orientation);
    
    const request: VideoGenerationRequest = {
      taskType: 'gen3a_turbo',
      internal: false,
      options: {
        name: `AI Video - ${Date.now()}`,
        seconds: 5,
        text_prompt: prompt,
        watermark: false,
        enhance_prompt: true,
        resolution: resolution,
        exploreMode: false
      }
    };

    const createResponse = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Runway-Version': '2024-09-13'
      },
      body: JSON.stringify(request)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.error('RunwayML API error:', createResponse.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: `RunwayML API error: ${createResponse.status}`,
          details: errorData
        }),
        { status: createResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const createData = await createResponse.json();
    const taskId = createData.id;
    console.log('Video generation task started:', taskId);

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const queryResponse = await fetch(`${baseUrl}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'X-Runway-Version': '2024-09-13'
        }
      });

      if (!queryResponse.ok) {
        const errorData = await queryResponse.text();
        console.error('Query task error:', queryResponse.status, errorData);
        throw new Error(`Failed to query task: ${queryResponse.status}`);
      }

      const result: VideoGenerationResponse = await queryResponse.json();
      console.log(`Polling attempt ${attempts + 1}: Status = ${result.status}, Progress = ${result.progress}%`);

      if (result.status === 'SUCCEEDED' && result.artifacts && result.artifacts.length > 0) {
        const videoUrl = result.artifacts[0].url;
        console.log('Video generation completed:', videoUrl);
        return new Response(
          JSON.stringify({ videoUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (result.status === 'FAILED') {
        console.error('Video generation failed');
        return new Response(
          JSON.stringify({ error: 'Video generation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    console.error('Video generation timed out');
    return new Response(
      JSON.stringify({ error: 'Video generation timed out after 5 minutes' }),
      { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-runway-video function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
