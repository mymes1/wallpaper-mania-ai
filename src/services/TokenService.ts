// Token management service for wallpaper generation
export interface TokenUsage {
  date: string; // YYYY-MM-DD format
  tokensUsed: number;
  imagesGenerated: number;
  downloadsUsed: number;
}

export class TokenService {
  private static readonly FREE_DAILY_TOKENS = 500;
  private static readonly TOKENS_PER_IMAGE = 50;
  private static readonly FREE_DAILY_DOWNLOADS = 5;
  private static readonly STORAGE_KEY = 'wallpaper_token_usage';

  private static getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private static getTodayUsage(): TokenUsage {
    const today = this.getTodayKey();
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      const usage: TokenUsage = JSON.parse(stored);
      if (usage.date === today) {
        return usage;
      }
    }
    
    // Return fresh usage for today
    return {
      date: today,
      tokensUsed: 0,
      imagesGenerated: 0,
      downloadsUsed: 0
    };
  }

  private static saveUsage(usage: TokenUsage): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usage));
  }

  static getRemainingTokens(isPremium: boolean): number {
    if (isPremium) return Infinity;
    
    const usage = this.getTodayUsage();
    return Math.max(0, this.FREE_DAILY_TOKENS - usage.tokensUsed);
  }

  static getRemainingDownloads(isPremium: boolean): number {
    if (isPremium) return Infinity;
    
    const usage = this.getTodayUsage();
    return Math.max(0, this.FREE_DAILY_DOWNLOADS - usage.downloadsUsed);
  }

  static canGenerateImage(isPremium: boolean): boolean {
    if (isPremium) return true;
    
    const remainingTokens = this.getRemainingTokens(isPremium);
    return remainingTokens >= this.TOKENS_PER_IMAGE;
  }

  static canDownload(isPremium: boolean): boolean {
    if (isPremium) return true;
    
    const remainingDownloads = this.getRemainingDownloads(isPremium);
    return remainingDownloads > 0;
  }

  static useTokensForImage(isPremium: boolean): boolean {
    if (isPremium) return true;
    
    if (!this.canGenerateImage(isPremium)) {
      return false;
    }

    const usage = this.getTodayUsage();
    usage.tokensUsed += this.TOKENS_PER_IMAGE;
    usage.imagesGenerated += 1;
    this.saveUsage(usage);
    
    return true;
  }

  static useDownload(isPremium: boolean): boolean {
    if (isPremium) return true;
    
    if (!this.canDownload(isPremium)) {
      return false;
    }

    const usage = this.getTodayUsage();
    usage.downloadsUsed += 1;
    this.saveUsage(usage);
    
    return true;
  }

  static getUsageStats(isPremium: boolean) {
    if (isPremium) {
      return {
        tokensUsed: 0,
        tokensRemaining: Infinity,
        imagesGenerated: this.getTodayUsage().imagesGenerated,
        downloadsUsed: 0,
        downloadsRemaining: Infinity,
        isPremium: true
      };
    }

    const usage = this.getTodayUsage();
    return {
      tokensUsed: usage.tokensUsed,
      tokensRemaining: this.getRemainingTokens(false),
      imagesGenerated: usage.imagesGenerated,
      downloadsUsed: usage.downloadsUsed,
      downloadsRemaining: this.getRemainingDownloads(false),
      isPremium: false
    };
  }

  static getTokensPerImage(): number {
    return this.TOKENS_PER_IMAGE;
  }
}