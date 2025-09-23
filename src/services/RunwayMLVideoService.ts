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
    if (!this.hasApiKey()) {
      throw new Error('RunwayML API key is required');
    }

    try {
      // Start video generation
      const taskId = await this.invokeVideoGeneration(prompt, orientation);
      
      // Poll for completion
      const videoUrl = await this.pollVideoGeneration(taskId);
      
      return videoUrl;
    } catch (error) {
      console.error('RunwayML video generation error:', error);
      throw error;
    }
  }

  private async invokeVideoGeneration(prompt: string, orientation: 'portrait' | 'landscape'): Promise<string> {
    const resolution = orientation === 'portrait' ? '768x1344' : '1344x768';
    
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

    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-09-13'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('RunwayML API error:', response.status, errorData);
      throw new Error(`RunwayML API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async queryVideoGeneration(taskId: string): Promise<VideoGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Runway-Version': '2024-09-13'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to query task: ${response.status} - ${errorData}`);
    }

    return await response.json();
  }

  private async pollVideoGeneration(taskId: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes maximum
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const result = await this.queryVideoGeneration(taskId);
        
        console.log(`RunwayML polling attempt ${attempts + 1}: Status = ${result.status}, Progress = ${result.progress}%`);

        if (result.status === 'SUCCEEDED' && result.artifacts && result.artifacts.length > 0) {
          const videoUrl = result.artifacts[0].url;
          console.log('RunwayML video generation completed:', videoUrl);
          return videoUrl;
        }

        if (result.status === 'FAILED') {
          throw new Error('Video generation failed');
        }

        // Wait before next poll
        await this.sleep(5000); // 5 seconds
        attempts++;
      } catch (error) {
        console.error('Error polling RunwayML task:', error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await this.sleep(5000);
      }
    }

    throw new Error('Video generation timed out after 5 minutes');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const runwayMLVideoService = RunwayMLVideoService.getInstance();