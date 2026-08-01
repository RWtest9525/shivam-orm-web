import { Request, Response } from 'express';
import { AIEngineService, AIReplyTone } from '../services/aiEngine.service.js';

// In-memory store for AI reply logs, prompt logs, and version history in demo sandbox
const memoryAIReplyLogs: any[] = [];
const memoryAIPromptLogs: any[] = [];

export async function analyzeContentHandler(req: Request, res: Response): Promise<void> {
  try {
    const { content, rating } = req.body;
    if (!content) {
      res.status(400).json({ success: false, error: 'Text content is required for analysis.' });
      return;
    }

    const result = AIEngineService.analyzeContent(content, rating);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function generateAIReplyHandler(req: Request, res: Response): Promise<void> {
  try {
    const { authorName, content, platform, tone = 'Professional', rating, targetId, targetType = 'REVIEW', currentVersion = 1 } = req.body;
    const companyId = (req as any).user?.companyId || 'c-client-demo';

    if (!content || !authorName) {
      res.status(400).json({ success: false, error: 'Author name and content are required.' });
      return;
    }

    const selectedTone = tone as AIReplyTone;

    // Check version count for targetId
    const existingVersions = memoryAIReplyLogs.filter((l) => l.targetId === targetId);
    const newVersionNumber = existingVersions.length + 1;

    const result = AIEngineService.generateAIReply({
      authorName,
      content,
      platform: platform || 'Play Store',
      tone: selectedTone,
      rating,
      currentVersion: newVersionNumber,
    });

    const replyLog = {
      id: `ai_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      targetType,
      targetId: targetId || `target_${Date.now()}`,
      promptUsed: result.promptUsed,
      tone: selectedTone,
      generatedReply: result.generatedReply,
      confidenceScore: result.confidenceScore,
      version: newVersionNumber,
      status: 'GENERATED',
      userEditedReply: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
      analysis: result.analysis,
    };

    memoryAIReplyLogs.push(replyLog);
    memoryAIPromptLogs.push({
      id: `ai_prompt_${Date.now()}`,
      companyId,
      promptText: result.promptUsed,
      tone: selectedTone,
      platform: platform || 'Play Store',
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        replyLog,
        allVersions: memoryAIReplyLogs.filter((l) => l.targetId === (targetId || replyLog.targetId)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function approveAIReplyHandler(req: Request, res: Response): Promise<void> {
  try {
    const { logId, finalReplyText } = req.body;
    const log = memoryAIReplyLogs.find((l) => l.id === logId);

    if (!log) {
      // Create ad-hoc approval log if not found
      const adhocLog = {
        id: logId || `ai_log_${Date.now()}`,
        companyId: (req as any).user?.companyId || 'c-client-demo',
        targetType: 'REVIEW',
        targetId: `target_${Date.now()}`,
        promptUsed: 'Ad-hoc user approval',
        tone: 'Professional',
        generatedReply: finalReplyText,
        userEditedReply: finalReplyText,
        confidenceScore: 0.98,
        version: 1,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      memoryAIReplyLogs.push(adhocLog);
      res.json({ success: true, message: 'Mandatory user approval recorded successfully.', data: adhocLog });
      return;
    }

    log.status = log.generatedReply === finalReplyText ? 'APPROVED' : 'EDITED';
    log.userEditedReply = finalReplyText;
    log.approvedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Mandatory user approval recorded successfully.',
      data: log,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAIHistoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { targetId } = req.params;
    const history = memoryAIReplyLogs
      .filter((l) => l.targetId === targetId)
      .sort((a, b) => b.version - a.version);

    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
