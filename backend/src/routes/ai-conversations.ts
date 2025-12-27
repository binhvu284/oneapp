import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import axios from 'axios'

const router = Router()

// Helper function to estimate tokens
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Helper function to call Gemini API
async function callGeminiAPI(apiKey: string, message: string, conversationHistory: any[] = []) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-conversations.ts:15',message:'Gemini API call started',data:{apiKeyPrefix:apiKey?.substring(0,7)+'...',messageLength:message.length,historyCount:conversationHistory.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
    
    messages.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // #region agent log
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-conversations.ts:32',message:'Gemini request details',data:{apiVersion:'v1beta',modelName:'gemini-flash-latest',endpoint:apiUrl.split('?')[0],messageCount:messages.length,temperature:0.7},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v9',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion

    const response = await axios.post(
      apiUrl,
      {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }
    )

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-conversations.ts:48',message:'Gemini response received',data:{hasCandidates:!!response.data?.candidates,candidatesLength:response.data?.candidates?.length,hasContent:!!response.data?.candidates?.[0]?.content},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        content: response.data.candidates[0].content.parts[0].text,
        tokens: estimateTokens(response.data.candidates[0].content.parts[0].text)
      }
    }
    
    throw new Error('Invalid response from Gemini API')
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-conversations.ts:62',message:'Gemini API error',data:{errorMessage:error.response?.data?.error?.message || error.message,errorStatus:error.response?.data?.error?.status,errorCode:error.response?.data?.error?.code,statusCode:error.response?.status,fullError:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    console.error('Gemini API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.error?.message || 'Failed to get response from Gemini')
  }
}

// Helper function to call OpenAI/ChatGPT API
async function callChatGPTAPI(apiKey: string, message: string, conversationHistory: any[] = []) {
  try {
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    
    messages.push({
      role: 'user',
      content: message
    })

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.choices?.[0]?.message?.content) {
      return {
        content: response.data.choices[0].message.content,
        tokens: response.data.usage?.completion_tokens || estimateTokens(response.data.choices[0].message.content)
      }
    }
    
    throw new Error('Invalid response from ChatGPT API')
  } catch (error: any) {
    console.error('ChatGPT API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.error?.message || 'Failed to get response from ChatGPT')
  }
}

/**
 * @route   POST /api/conversations
 * @desc    Create a new conversation
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { agent_id, title = 'New Conversation', user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' })
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id,
        agent_id,
        title
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for a user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' })
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*, ai_agents(name, avatar_url, model)')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * @route   GET /api/conversations/:id
 * @desc    Get a single conversation with messages
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('*, ai_agents(name, avatar_url, model)')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (convError) throw convError

    const { data: messages, error: msgError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (msgError) throw msgError

    res.json({ success: true, data: { ...conversation, messages } })
  } catch (error: any) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Send a message and get AI response
 */
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content, user_id } = req.body

    if (!content || !user_id) {
      return res.status(400).json({ success: false, message: 'Content and user_id are required' })
    }

    // Get conversation with agent details
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('*, ai_agents(*)')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    const agent = conversation.ai_agents

    if (!agent) {
      return res.status(400).json({ success: false, message: 'No agent associated with this conversation' })
    }

    // Save user message
    const userTokens = estimateTokens(content)
    const { data: userMessage, error: userMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: id,
        role: 'user',
        content,
        token_count: userTokens
      })
      .select()
      .single()

    if (userMsgError) throw userMsgError

    // Get conversation history (last 10 messages for context)
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    const conversationHistory = (history || []).reverse()

    // Call AI API based on agent's model
    let aiResponse
    
    if (agent.model === 'gemini' || agent.model_provider === 'google') {
      if (!agent.api_key) {
        return res.status(400).json({ success: false, message: 'Gemini API key not configured' })
      }
      aiResponse = await callGeminiAPI(agent.api_key, content, conversationHistory.slice(0, -1))
    } else if (agent.model === 'chatgpt' || agent.model_provider === 'openai') {
      if (!agent.api_key) {
        return res.status(400).json({ success: false, message: 'ChatGPT API key not configured' })
      }
      aiResponse = await callChatGPTAPI(agent.api_key, content, conversationHistory.slice(0, -1))
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported AI model' })
    }

    // Save assistant message
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: id,
        role: 'assistant',
        content: aiResponse.content,
        token_count: aiResponse.tokens,
        metadata: { model: agent.model }
      })
      .select()
      .single()

    if (assistantMsgError) throw assistantMsgError

    // Update conversation title if it's the first message
    if (conversation.message_count === 0) {
      const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '')
      await supabase
        .from('ai_conversations')
        .update({ title: newTitle })
        .eq('id', id)
    }

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    })
  } catch (error: any) {
    console.error('Error sending message:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * @route   PATCH /api/conversations/:id
 * @desc    Update conversation (title, pinned status, etc.)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('ai_conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating conversation:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Soft delete a conversation
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router

