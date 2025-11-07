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

export class RunwayMLVideoService {
  private static instance: RunwayMLVideoService;
  private apiKey: string = '';
  private baseUrl: string = 'https://api.runwayml.com/v1';

  constructor() {
    // Load from localStorage with the provided API key
    const providedApiKey = 'key_4be6e3d9e61e5ddf231c822a04053884f457b4301da6818c1a458583ecddbeac77eb6b6953db3851c00caaca8bd90511bafbe824d76a9f66acf55998812beac4';
    
    this.apiKey = localStorage.getItem('runwayml_api_key') || '';
    if (!this.apiKey) {
      this.apiKey = providedApiKey;
      localStorage.setItem('runwayml_api_key', providedApiKey);
    }
  }

  static getInstance(): RunwayMLVideoService {
    if (!RunwayMLVideoService.instance) {
      RunwayMLVideoService.instance = new RunwayMLVideoService();
    }
    return RunwayMLVideoService.instance;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('runwayml_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async generateVideo(prompt: string, orientation: 'portrait' | 'landscape' = 'landscape'): Promise<string> {
    try {
      // Call edge function to generate video
      const videoUrl = await this.callEdgeFunction(prompt, orientation);
      return videoUrl;
    } catch (error) {
      console.error('RunwayML video generation error:', error);
      throw error;
    }
  }

  private async callEdgeFunction(prompt: string, orientation: 'portrait' | 'landscape'): Promise<string> {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-runway-video`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, orientation })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', response.status, errorText);
      let message = `Failed to generate video: ${response.status}`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error) {
          message = parsed.error + (parsed.details ? ` - ${parsed.details}` : '');
        }
      } catch {}
      throw new Error(message);
    }

    const data = await response.json();
    return data.videoUrl;
  }

}

export const runwayMLVideoService = RunwayMLVideoService.getInstance();