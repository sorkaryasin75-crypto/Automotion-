export function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '▶ Start Work', callback_data: 'start_work' }, { text: '🧩 Current Task', callback_data: 'current_task' }],
      [{ text: '💰 Balance', callback_data: 'balance' }, { text: '📊 Statistics', callback_data: 'statistics' }],
      [{ text: '📜 Session', callback_data: 'session' }, { text: '⚙ Settings', callback_data: 'settings' }],
      [{ text: '⛔ Stop Work', callback_data: 'stop_work' }]
    ]
  };
}

export function getTaskActionKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✏ Submit Answer', callback_data: 'submit_answer' }, { text: '⏭ Skip', callback_data: 'skip_task' }],
      [{ text: '🔄 Refresh', callback_data: 'refresh_task' }, { text: '⛔ Stop Work', callback_data: 'stop_work' }]
    ]
  };
}

export function getSuccessKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '▶ Next Task', callback_data: 'start_work' }],
      [{ text: '⛔ Stop Work', callback_data: 'stop_work' }]
    ]
  };
}

export function getIncorrectKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔄 Retry', callback_data: 'submit_answer' }, { text: '⏭ Skip', callback_data: 'skip_task' }],
      [{ text: '⛔ Stop Work', callback_data: 'stop_work' }]
    ]
  };
}

export function getBalanceKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🔄 Refresh', callback_data: 'balance' }, { text: '⬅ Back', callback_data: 'main_menu' }]
    ]
  };
}

export function getAdminKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📊 System Status', callback_data: 'admin_status' }, { text: '👥 Active Workers', callback_data: 'admin_workers' }],
      [{ text: '⛔ Stop All Workers', callback_data: 'admin_stopall' }, { text: '⬅ Back', callback_data: 'main_menu' }]
    ]
  };
}
