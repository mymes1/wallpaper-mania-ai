// Enhanced image generation service with better error handling and fallbacks
export async function generateImage(prompt: string, orientation: 'portrait' | 'landscape' = 'landscape'): Promise<string> {
  try {
    console.log('Generating image for prompt:', prompt);
    
    // Determine dimensions based on orientation
    const dimensions = orientation === 'portrait' 
      ? { width: 1080, height: 1920 }
      : { width: 1920, height: 1080 };

    // Try multiple free AI image generation APIs
    const apis = [
      {
        name: 'Pollinations',
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${dimensions.width}&height=${dimensions.height}&seed=${Math.floor(Math.random() * 1000000)}&model=flux`,
        method: 'GET'
      },
      {
        name: 'Picsum with overlay',
        url: `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Math.floor(Math.random() * 1000)}`,
        method: 'GET'
      }
    ];

    // Try Pollinations API first
    try {
      console.log('Trying Pollinations API...');
      const response = await fetch(apis[0].url, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        // Convert blob to base64 data URL for persistent storage
        const dataUrl = await blobToDataUrl(blob);
        console.log('Pollinations API success');
        return dataUrl;
      }
    } catch (error) {
      console.log('Pollinations API failed:', error);
    }

    // Try Picsum as fallback
    try {
      console.log('Trying Picsum fallback...');
      const response = await fetch(apis[1].url);
      if (response.ok) {
        const blob = await response.blob();
        // Convert blob to base64 data URL for persistent storage
        const dataUrl = await blobToDataUrl(blob);
        console.log('Picsum API success');
        return dataUrl;
      }
    } catch (error) {
      console.log('Picsum API failed:', error);
    }

    // Final fallback to canvas generation
    console.log('Using canvas generation fallback...');
    return generateCanvasImage(prompt, orientation);
  } catch (error) {
    console.error('All image generation methods failed:', error);
    return generateCanvasImage(prompt, orientation);
  }
}

function generateCanvasImage(prompt: string, orientation: 'portrait' | 'landscape' = 'landscape'): string {
  console.log('Generating canvas image for prompt:', prompt);
  
  const dimensions = orientation === 'portrait' 
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1080 };
    
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Create gradient based on prompt keywords
  const colors = getColorsFromPrompt(prompt);
  
  // Create animated-style gradient
  const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, dimensions.width, dimensions.height);

  // Add geometric patterns based on prompt
  addPatterns(ctx, prompt, dimensions);
  
  // Add text overlay
  addTextOverlay(ctx, prompt, dimensions);

  // Add AI-generated indicator
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(20, 20, 200, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('🎨 AI Generated', 30, 45);
  ctx.font = '12px Arial';
  ctx.fillText('Wallpaper Mania', 30, 65);

  return canvas.toDataURL('image/png');
}

function addPatterns(ctx: CanvasRenderingContext2D, prompt: string, dimensions: { width: number; height: number }) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Add circles for space/cosmic themes
  if (lowerPrompt.includes('space') || lowerPrompt.includes('cosmic') || lowerPrompt.includes('star')) {
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * dimensions.width,
        Math.random() * dimensions.height,
        Math.random() * 4 + 1,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
      ctx.fill();
    }
  }
  
  // Add geometric shapes for abstract themes
  if (lowerPrompt.includes('abstract') || lowerPrompt.includes('geometric')) {
    for (let i = 0; i < 25; i++) {
      ctx.save();
      ctx.translate(Math.random() * dimensions.width, Math.random() * dimensions.height);
      ctx.rotate(Math.random() * Math.PI * 2);
      
      ctx.beginPath();
      ctx.rect(-50, -50, 100, 100);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Add wave patterns for water themes
  if (lowerPrompt.includes('wave') || lowerPrompt.includes('ocean') || lowerPrompt.includes('water')) {
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 200 + i * 100);
      
      for (let x = 0; x <= dimensions.width; x += 20) {
        const y = 200 + i * 100 + Math.sin(x * 0.01 + i) * 50;
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - i * 0.04})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
}

function addTextOverlay(ctx: CanvasRenderingContext2D, prompt: string, dimensions: { width: number; height: number }) {
  // Add subtle text overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  
  // Split prompt into words and display key words
  const words = prompt.split(' ').slice(0, 4); // Take first 4 words
  const maxWidth = dimensions.width * 0.8;
  const centerX = dimensions.width / 2;
  const startY = dimensions.height * 0.4;
  
  words.forEach((word, index) => {
    const text = word.toUpperCase();
    const y = startY + (index * 80);
    
    // Add shadow effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(text, centerX + 2, y + 2);
    
    // Add main text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillText(text, centerX, y);
  });
}

function getColorsFromPrompt(prompt: string): string[] {
  const colorMap: { [key: string]: string[] } = {
    'dragon': ['#ff4444', '#ff8800', '#ffaa00', '#ff6600'],
    'fire': ['#cc0000', '#ff3300', '#ff6600', '#ffaa00'],
    'flame': ['#cc0000', '#ff3300', '#ff6600', '#ffaa00'],
    'burn': ['#cc0000', '#ff3300', '#ff6600', '#ffaa00'],
    'ocean': ['#0066cc', '#0099ff', '#66ccff', '#99ddff'],
    'water': ['#0066cc', '#0099ff', '#66ccff', '#99ddff'],
    'sea': ['#0066cc', '#0099ff', '#66ccff', '#99ddff'],
    'wave': ['#0066cc', '#0099ff', '#66ccff', '#99ddff'],
    'forest': ['#228833', '#44aa44', '#66cc66', '#88dd88'],
    'nature': ['#228833', '#44aa44', '#66cc66', '#88dd88'],
    'tree': ['#228833', '#44aa44', '#66cc66', '#88dd88'],
    'sunset': ['#ff6600', '#ff9900', '#ffcc00', '#ffdd44'],
    'sunrise': ['#ff6600', '#ff9900', '#ffcc00', '#ffdd44'],
    'space': ['#000033', '#330066', '#660099', '#9900cc'],
    'cosmic': ['#000033', '#330066', '#660099', '#9900cc'],
    'galaxy': ['#000033', '#330066', '#660099', '#9900cc'],
    'star': ['#000033', '#330066', '#660099', '#9900cc'],
    'ice': ['#66ccff', '#99ddff', '#cceeee', '#ffffff'],
    'snow': ['#66ccff', '#99ddff', '#cceeee', '#ffffff'],
    'mountain': ['#666666', '#888888', '#aaaaaa', '#cccccc'],
    'desert': ['#cc9966', '#ddaa77', '#eebb88', '#ffcc99'],
    'purple': ['#6600cc', '#8833dd', '#aa66ee', '#cc99ff'],
    'blue': ['#0066cc', '#3388dd', '#66aaee', '#99ccff'],
    'red': ['#cc0000', '#dd3333', '#ee6666', '#ff9999'],
    'green': ['#00cc00', '#33dd33', '#66ee66', '#99ff99'],
    'abstract': ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
    'geometric': ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
    'minimal': ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8'],
    'neon': ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
    'cyberpunk': ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
  };

  const lowerPrompt = prompt.toLowerCase();
  
  // Find matching keywords
  for (const [keyword, colors] of Object.entries(colorMap)) {
    if (lowerPrompt.includes(keyword)) {
      return colors;
    }
  }

  // Default gradient colors
  return ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];
}

// Helper function to convert blob to data URL
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}