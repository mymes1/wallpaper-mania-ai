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

    const ratio = orientation === 'portrait' ? '768:1280' : '1280:768';
    const baseUrl = 'https://api.dev.runwayml.com';

    // Start video generation using the SDK-compatible API
    console.log('Starting video generation with prompt:', prompt, 'orientation:', orientation);
    
    const requestBody = {
      promptText: prompt,
      model: 'gen3a_turbo',
      ratio: ratio,
      duration: 5,
      watermark: false
    };

    const createUrl = `${baseUrl}/v1/text_to_video`;
    console.log('Runway create URL:', createUrl, 'body:', requestBody);

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify(requestBody)
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
    const taskId = createData.id || createData.task?.id;
    if (!taskId) {
      console.error('No task ID returned:', createData);
      return new Response(
        JSON.stringify({ error: 'Failed to get task ID from API response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Video generation task started:', taskId);

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const queryResponse = await fetch(`${baseUrl}/v1/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'X-Runway-Version': '2024-11-06'
        }
      });

      if (!queryResponse.ok) {
        const errorData = await queryResponse.text();
        console.error('Query task error:', queryResponse.status, errorData);
        throw new Error(`Failed to query task: ${queryResponse.status}`);
      }

      const result: VideoGenerationResponse & { output?: string[] } = await queryResponse.json();
      console.log(`Polling attempt ${attempts + 1}: Status = ${result.status}, Progress = ${result.progress}%`);

      if (result.status === 'SUCCEEDED') {
        let videoUrl = '';
        if (result.artifacts && result.artifacts.length > 0) {
          videoUrl = result.artifacts[0].url;
        } else if ((result as any).output && (result as any).output.length > 0) {
          videoUrl = (result as any).output[0];
        }
        if (videoUrl) {
          console.log('Video generation completed:', videoUrl);
          return new Response(
            JSON.stringify({ videoUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
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
