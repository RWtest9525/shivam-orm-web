export type AIReplyTone = 'Professional' | 'Friendly' | 'Formal' | 'Short' | 'Detailed';

export interface AIAnalysisResult {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRISIS';
  spamStatus: {
    isSpam: boolean;
    spamScore: number; // 0 to 100
    reason: string;
  };
  category:
    | 'Product Quality'
    | 'Customer Service'
    | 'Delivery & Shipping'
    | 'Pricing & Billing'
    | 'App Bug / Technical Issue'
    | 'General Feedback';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  language: string;
  confidenceScore: number; // 0.85 to 0.99
}

export interface AIReplyGenerationResult {
  generatedReply: string;
  tone: AIReplyTone;
  version: number;
  confidenceScore: number;
  promptUsed: string;
  analysis: AIAnalysisResult;
}

export class AIEngineService {
  /**
   * Performs NLP Analysis on text (Sentiment, Spam, Category, Priority, Language)
   */
  public static analyzeContent(text: string, rating?: number): AIAnalysisResult {
    const lower = text.toLowerCase();

    // 1. Sentiment Analysis
    let sentiment: AIAnalysisResult['sentiment'] = 'NEUTRAL';
    if (rating !== undefined) {
      if (rating >= 4) sentiment = 'POSITIVE';
      else if (rating === 3) sentiment = 'NEUTRAL';
      else if (rating === 2) sentiment = 'NEGATIVE';
      else sentiment = 'CRISIS';
    } else {
      if (lower.includes('great') || lower.includes('love') || lower.includes('awesome') || lower.includes('superb') || lower.includes('excellent')) {
        sentiment = 'POSITIVE';
      } else if (lower.includes('worst') || lower.includes('scam') || lower.includes('horrible') || lower.includes('refund') || lower.includes('sucks')) {
        sentiment = lower.includes('scam') || lower.includes('lawsuit') || lower.includes('stolen') ? 'CRISIS' : 'NEGATIVE';
      }
    }

    // 2. Spam Detection
    const spamKeywords = ['crypto', 'whatsapp me', 'telegram', 'free money', 'bit.ly', 'earn $', 'casino', 'slot'];
    const hasSpamKeyword = spamKeywords.some((k) => lower.includes(k));
    const spamScore = hasSpamKeyword ? 88 : lower.length < 5 ? 45 : 4;
    const isSpam = spamScore >= 70;
    const spamReason = isSpam
      ? 'Contains suspected promotional or external channel referral spam.'
      : 'Clean text. No spam patterns detected.';

    // 3. Review Categorization
    let category: AIAnalysisResult['category'] = 'General Feedback';
    if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('courier') || lower.includes('late')) {
      category = 'Delivery & Shipping';
    } else if (lower.includes('bug') || lower.includes('crash') || lower.includes('login') || lower.includes('error') || lower.includes('update')) {
      category = 'App Bug / Technical Issue';
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('money') || lower.includes('charge') || lower.includes('billing')) {
      category = 'Pricing & Billing';
    } else if (lower.includes('support') || lower.includes('agent') || lower.includes('call') || lower.includes('reply') || lower.includes('help')) {
      category = 'Customer Service';
    } else if (lower.includes('quality') || lower.includes('material') || lower.includes('product') || lower.includes('broken')) {
      category = 'Product Quality';
    }

    // 4. Priority Detection
    let priority: AIAnalysisResult['priority'] = 'MEDIUM';
    if (sentiment === 'CRISIS' || lower.includes('urgent') || lower.includes('immediate') || lower.includes('help')) {
      priority = 'URGENT';
    } else if (sentiment === 'NEGATIVE') {
      priority = 'HIGH';
    } else if (sentiment === 'POSITIVE') {
      priority = 'LOW';
    }

    // 5. Language Detection
    let language = 'English';
    if (/[äöüß]/.test(text)) language = 'German';
    else if (/[éèêàç]/.test(text)) language = 'French';
    else if (/[ñáéíóú]/.test(text)) language = 'Spanish';
    else if (/[\u0900-\u097F]/.test(text)) language = 'Hindi';

    return {
      sentiment,
      spamStatus: {
        isSpam,
        spamScore,
        reason: spamReason,
      },
      category,
      priority,
      language,
      confidenceScore: Math.round((0.92 + Math.random() * 0.06) * 100) / 100,
    };
  }

  /**
   * Generates tone-tailored AI reply suggestions for reviews or direct messages.
   * Supports 5 tones: Professional, Friendly, Formal, Short, Detailed.
   */
  public static generateAIReply(params: {
    authorName: string;
    content: string;
    platform: string;
    tone: AIReplyTone;
    rating?: number;
    currentVersion?: number;
  }): AIReplyGenerationResult {
    const { authorName, content, platform, tone, rating, currentVersion = 1 } = params;
    const analysis = this.analyzeContent(content, rating);

    const firstName = authorName.split(' ')[0] || authorName;
    const version = currentVersion + (currentVersion > 1 ? 0 : 0);

    let generatedReply = '';

    switch (tone) {
      case 'Friendly':
        if (analysis.sentiment === 'POSITIVE') {
          generatedReply = `Hey ${firstName}! 😊 Thank you so much for the awesome words. We are thrilled to hear you love our service on ${platform}! Let us know if you ever need anything. Have a fantastic day ahead! 🎉`;
        } else {
          generatedReply = `Hi ${firstName}, thanks for sharing your honest feedback with us! We're super sorry to hear about your experience. Please DM us your details so we can fix this for you right away! 🙏`;
        }
        break;

      case 'Formal':
        if (analysis.sentiment === 'POSITIVE') {
          generatedReply = `Dear ${authorName},\n\nWe extend our sincere appreciation for your positive evaluation regarding your experience on ${platform}. Ensuring the highest quality standard remains our top priority.\n\nRespectfully,\nCustomer Operations Team`;
        } else {
          generatedReply = `Dear ${authorName},\n\nWe formally acknowledge receipt of your concern regarding ${analysis.category.toLowerCase()}. Please accept our apologies for any inconvenience caused. Our team requests you to provide your reference number for immediate investigation.\n\nSincerely,\nExecutive Client Services`;
        }
        break;

      case 'Short':
        if (analysis.sentiment === 'POSITIVE') {
          generatedReply = `Thanks for the great review, ${firstName}! We really appreciate your support.`;
        } else {
          generatedReply = `Sorry for the trouble, ${firstName}. Please DM us your account ID so we can resolve this immediately.`;
        }
        break;

      case 'Detailed':
        if (analysis.sentiment === 'POSITIVE') {
          generatedReply = `Hello ${authorName},\n\nThank you for taking the time to write such a comprehensive review! We are delighted that our efforts in ${analysis.category.toLowerCase()} met your expectations. Feedback like yours inspires our team to continuously innovate. Should you have any additional suggestions, please reach out to us anytime.`;
        } else {
          generatedReply = `Hello ${authorName},\n\nThank you for bringing this issue regarding ${analysis.category.toLowerCase()} to our direct attention. We take all feedback seriously and have escalated your feedback to our Lead Team (Priority: ${analysis.priority}). To expedite resolution, please email or DM us with your account details.`;
        }
        break;

      case 'Professional':
      default:
        if (analysis.sentiment === 'POSITIVE') {
          generatedReply = `Hi ${firstName}, thank you for your feedback! We're glad to know you had a positive experience on ${platform}. We appreciate your support and look forward to serving you again.`;
        } else {
          generatedReply = `Hello ${firstName}, thank you for reaching out. We apologize for the frustration regarding ${analysis.category.toLowerCase()}. Please share your registered contact details via private message so we can investigate and assist you promptly.`;
        }
        break;
    }

    const promptUsed = `[System Prompt]: Generate a ${tone} AI response for customer "${authorName}" on ${platform}. [Input]: "${content}". [Detected Category]: ${analysis.category}, [Sentiment]: ${analysis.sentiment}.`;

    return {
      generatedReply,
      tone,
      version,
      confidenceScore: analysis.confidenceScore,
      promptUsed,
      analysis,
    };
  }
}
