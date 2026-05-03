import api from './api';

export async function listMessages(query?: any) {
  const res = await api.get('/api/chat/messages', { params: query });
  return res.data;
}

export async function sendMessage(payload: any) {
  const res = await api.post('/api/chat/messages', payload);
  return res.data;
}

export async function scheduleMessage(payload: any) {
  const res = await api.post('/api/chat/messages', payload);
  return res.data;
}

export async function getConversation(conversationId: string) {
  const res = await api.get(`/api/chat/conversation/${encodeURIComponent(conversationId)}`);
  return res.data;
}

export async function markConversationRead(conversationId: string) {
  const res = await api.post(`/api/chat/conversation/${encodeURIComponent(conversationId)}/read`);
  return res.data;
}

export async function listConversationStatuses() {
  const res = await api.get('/api/chat/conversations/statuses');
  return res.data.statuses || {};
}

export async function setConversationStatus(conversationId: string, status: string) {
  const res = await api.post(`/api/chat/conversation/${encodeURIComponent(conversationId)}/status`, { status });
  return res.data;
}

export async function blockUser(userId: string) {
  const res = await api.post(`/api/chat/user/${encodeURIComponent(userId)}/block`);
  return res.data;
}

export async function deleteMessage(messageId: string) {
  const res = await api.delete(`/api/chat/messages/${encodeURIComponent(messageId)}`);
  return res.data;
}

export async function flagConversation(conversationId: string, reason?: string) {
  const res = await api.post(`/api/chat/conversation/${encodeURIComponent(conversationId)}/flag`, { reason });
  return res.data;
}

export async function getChatStats() {
  const res = await api.get('/api/chat/stats');
  return res.data;
}
