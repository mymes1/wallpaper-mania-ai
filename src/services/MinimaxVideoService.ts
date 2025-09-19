interface VideoGenerationRequest {
  prompt: string;
  model: string;
  duration: number;
  resolution: string;
}

interface VideoGenerationResponse {
  task_id: string;
  status: string;
}

interface VideoQueryResponse {
  status: 'Preparing' | 'Queueing' | 'Processing' | 'Success' | 'Fail';
  file_id?: string;
}

interface VideoFileResponse {
  file: {
    download_url: string;
  };
}

export class MinimaxVideoService {
  private static instance: MinimaxVideoService;
  private apiKey: string | null = null;
  private readonly defaultApiKey = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJEZXNoZW4gTWNmYXJsYW5lIiwiVXNlck5hbWUiOiJEZXNoZW4gTWNmYXJsYW5lIiwiQWNjb3VudCI6IiIsIlN1YmplY3RJRCI6IjE5Njg2MDM1NDUzMjIxMzE2MjgiLCJQaG9uZSI6IiIsIkdyb3VwSUQiOiIxOTY4NjAzNTQ1MzE3OTQxNDIwIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiZGVzaGVuLm1jZmFybGFuZUBtYXJpc3Rzai5jby56YSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTA5LTE5IDE1OjM2OjEwIiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.Pd5er27Ui8wRQyD9tQV4KPiuLl23CTNZDZojQwEdmfrHT8Bx5o_KPhmcjVTRvmA-6SD2-F0jx-BD2AuW1_b3-2esNYmlJnkA1a0SAGD6OfFnk8G91bwn_7L";

  constructor() {
    // Try to get API key from localStorage, fallback to default
    this.apiKey = localStorage.getItem('minimax_api_key') || this.defaultApiKey;
    
    // Store the default API key if none exists
    if (!localStorage.getItem('minimax_api_key')) {
      localStorage.setItem('minimax_api_key', this.defaultApiKey);
    }
  }

  static getInstance(): MinimaxVideoService {
    if (!MinimaxVideoService.instance) {
      MinimaxVideoService.instance = new MinimaxVideoService();
    }
    return MinimaxVideoService.instance;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('minimax_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async generateVideo(
    prompt: string, 
    orientation: 'portrait' | 'landscape' = 'landscape'
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('MiniMax API key is required. Please set it first.');
    }

    try {
      console.log("-----------------Submit video generation task-----------------");
      
      // Submit video generation task
      const taskId = await this.invokeVideoGeneration(prompt, orientation);
      console.log("Video generation task submitted successfully, task ID:", taskId);

      // Poll for completion
      const fileId = await this.pollVideoGeneration(taskId);
      
      // Fetch and return video URL
      const videoUrl = await this.fetchVideoResult(fileId);
      console.log("---------------Successful---------------");
      
      return videoUrl;
    } catch (error) {
      console.error("Video generation failed:", error);
      throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async invokeVideoGeneration(prompt: string, orientation: 'portrait' | 'landscape'): Promise<string> {
    const resolution = orientation === 'portrait' ? '720P' : '1080P'; // Adjust as needed
    
    const payload: VideoGenerationRequest = {
      prompt: prompt,
      model: "MiniMax-Hailuo-02",
      duration: 6,
      resolution: resolution
    };

    const response = await fetch("https://api.minimax.io/v1/video_generation", {
      method: "POST",
      headers: {
        'authorization': `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const result: VideoGenerationResponse = await response.json();
    return result.task_id;
  }

  private async queryVideoGeneration(taskId: string): Promise<{ fileId: string; status: string }> {
    const response = await fetch(`https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`, {
      method: "GET",
      headers: {
        'authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.status}`);
    }

    const result: VideoQueryResponse = await response.json();
    
    switch (result.status) {
      case 'Preparing':
        console.log("...Preparing...");
        return { fileId: "", status: 'Preparing' };
      case 'Queueing':
        console.log("...In the queue...");
        return { fileId: "", status: 'Queueing' };
      case 'Processing':
        console.log("...Generating...");
        return { fileId: "", status: 'Processing' };
      case 'Success':
        return { fileId: result.file_id || "", status: "Finished" };
      case 'Fail':
        return { fileId: "", status: "Fail" };
      default:
        return { fileId: "", status: "Unknown" };
    }
  }

  private async pollVideoGeneration(taskId: string): Promise<string> {
    const maxAttempts = 60; // 10 minutes max (10 seconds * 60)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await this.sleep(10000); // Wait 10 seconds
      attempts++;

      const { fileId, status } = await this.queryVideoGeneration(taskId);
      
      if (fileId) {
        return fileId;
      } else if (status === "Fail" || status === "Unknown") {
        throw new Error(`Video generation failed with status: ${status}`);
      }
      
      // Continue polling for other statuses
    }

    throw new Error("Video generation timeout - exceeded maximum wait time");
  }

  private async fetchVideoResult(fileId: string): Promise<string> {
    console.log("---------------Video generated successfully, downloading now---------------");
    
    const response = await fetch(`https://api.minimax.io/v1/files/retrieve?file_id=${fileId}`, {
      method: "GET",
      headers: {
        'authorization': `Bearer ${this.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`File retrieval failed: ${response.status}`);
    }

    const result: VideoFileResponse = await response.json();
    const downloadUrl = result.file.download_url;
    
    console.log("Video download link:", downloadUrl);
    
    // Download the video and create a blob URL
    const videoResponse = await fetch(downloadUrl);
    if (!videoResponse.ok) {
      throw new Error(`Video download failed: ${videoResponse.status}`);
    }

    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return videoUrl;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const minimaxVideoService = MinimaxVideoService.getInstance();