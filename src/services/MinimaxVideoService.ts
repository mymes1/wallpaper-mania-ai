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
  private readonly defaultApiKey = "";
  private groupId: string | null = null;
  private readonly defaultGroupId = "1968603545317941420";
  private readonly baseUrls = [
    "https://api.minimax.chat",
    "https://api.minimax.io"
  ];
  private baseUrl: string = this.baseUrls[0];

  constructor() {
    // Load from localStorage; set the provided API key if not already stored
    const providedApiKey = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJEZXNoZW4gTWNmYXJsYW5lIiwiVXNlck5hbWUiOiJEZXNoZW4gTWNmYXJsYW5lIiwiQWNjb3VudCI6IiIsIlN1YmplY3RJRCI6IjE5Njg2MDM1NDUzMjIxMzE2MjgiLCJQaG9uZSI6IiIsIkdyb3VwSUQiOiIxOTY4NjAzNTQ1MzE3OTQxNDIwIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiZGVzaGVuLm1jZmFybGFuZUBtYXJpc3Rzai5jby56YSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTA5LTIzIDE5OjUyOjQwIiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.yZ8fgIs-Fp9MSpkzm9ssw7BcE7yuBblqbn93zL_WtdQ2w5WPsolifIBypGBJ7SRkyc2gGGvsAUKME7mFSFHAoCtKxfY1D1hCZ_D1Dz_Aj-QAOpXD3GDgZEbTUukdMWC0lzjm6iFubNkYwrxePnI6TOEi28uKh9F7wDgPtUgf-Pof9O4Vwg5Q8z5DvDxvPsX8WEo4gEFEjc3T-Ejj82o2XvZ6wSSuHEl2BsIFijjDTklr-yqMzCgn08uCSvV3cRFjIuHD8f5_4D3j1EV38BleQkcvlEzOzAjgow-h23ntPXd4F3zOLuP4smyYcBHakb_DYeeXNjlHm44Df26X2UdgtA';
    
    this.apiKey = localStorage.getItem('minimax_api_key');
    if (!this.apiKey) {
      this.apiKey = providedApiKey;
      localStorage.setItem('minimax_api_key', providedApiKey);
    }
    
    this.groupId = localStorage.getItem('minimax_group_id') || this.defaultGroupId;
    const storedBaseUrl = localStorage.getItem('minimax_base_url');
    this.baseUrl = storedBaseUrl || this.baseUrls[0]; // default to regional .chat
    
    // Persist defaults for non-sensitive values only
    if (!localStorage.getItem('minimax_group_id')) {
      localStorage.setItem('minimax_group_id', this.defaultGroupId);
    }
    if (!storedBaseUrl) {
      localStorage.setItem('minimax_base_url', this.baseUrl);
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
    return typeof this.apiKey === 'string' && this.apiKey.trim().length > 0;
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

    const response = await fetch(`https://api.minimax.chat/v1/video_generation?GroupId=${this.groupId}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const result: any = await response.json();
    
    // Check if the response has an error
    if (result.base_resp && result.base_resp.status_code !== 1000) {
      throw new Error(`API Error: ${result.base_resp.status_msg || 'Unknown error'}`);
    }
    
    // Return the task_id from the correct location in the response
    return result.task_id || result.data?.task_id;
  }

  private async queryVideoGeneration(taskId: string): Promise<{ fileId: string; status: string }> {
    const response = await fetch(`https://api.minimax.chat/v1/query/video_generation?task_id=${taskId}&GroupId=${this.groupId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.status}`);
    }

    const result: any = await response.json();
    
    // Check if the response has an error
    if (result.base_resp && result.base_resp.status_code !== 1000) {
      throw new Error(`API Error: ${result.base_resp.status_msg || 'Unknown error'}`);
    }
    
    // Get the actual status from the correct location
    const status = result.status || result.data?.status;
    const fileId = result.file_id || result.data?.file_id;
    
    switch (status) {
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
        return { fileId: fileId || "", status: "Finished" };
      case 'Fail':
        return { fileId: "", status: "Fail" };
      default:
        console.log("Unknown status:", status, "Full response:", result);
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
    
    const response = await fetch(`https://api.minimax.chat/v1/files/retrieve?file_id=${fileId}&GroupId=${this.groupId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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