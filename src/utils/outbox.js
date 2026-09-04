const OUTBOX_KEY = 'chat_outbox';

/**
 * Safely retrieve all queued messages from localStorage.
 * @returns {Array} Array of queued message objects.
 */
export function getOutbox() {
  try {
    const data = localStorage.getItem(OUTBOX_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading outbox from localStorage:', error);
    return [];
  }
}

/**
 * Helper to save messages array back to localStorage.
 * @param {Array} outbox 
 */
function saveOutbox(outbox) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
  } catch (error) {
    console.error('Error saving outbox to localStorage:', error);
  }
}

/**
 * Appends a new message to the outbox queue.
 * @param {Object} message - Optimistic message object (must have tempId / _id, group_id, message_text, status).
 * @returns {Array} The updated outbox array.
 */
export function enqueueOutbox(message) {
  const currentOutbox = getOutbox();
  const updatedOutbox = [...currentOutbox, message];
  saveOutbox(updatedOutbox);
  return updatedOutbox;
}

/**
 * Updates the status of an item in the outbox ('pending' | 'sending' | 'failed').
 * @param {string} tempId - Temporary identifier of the message.
 * @param {'pending' | 'sending' | 'failed'} status - New status.
 * @returns {Array} The updated outbox array.
 */
export function updateOutboxStatus(tempId, status) {
  const currentOutbox = getOutbox();
  const updatedOutbox = currentOutbox.map((item) =>
    item.tempId === tempId || item._id === tempId ? { ...item, status } : item
  );
  saveOutbox(updatedOutbox);
  return updatedOutbox;
}

/**
 * Deletes a processed message from the outbox.
 * @param {string} tempId - Temporary identifier of the message to remove.
 * @returns {Array} The updated outbox array.
 */
export function removeFromOutbox(tempId) {
  const currentOutbox = getOutbox();
  const updatedOutbox = currentOutbox.filter(
    (item) => item.tempId !== tempId && item._id !== tempId
  );
  saveOutbox(updatedOutbox);
  return updatedOutbox;
}

/**
 * Filters outbox messages for a specific group/chat.
 * @param {number|string} groupId - The target group ID.
 * @returns {Array} Array of queued messages for the specified group.
 */
export function getOutboxForGroup(groupId) {
  const currentOutbox = getOutbox();
  return currentOutbox.filter(
    (item) => Number(item.group_id) === Number(groupId)
  );
}

/**
 * Clears all items from the outbox.
 */
export function clearOutbox() {
  try {
    localStorage.removeItem(OUTBOX_KEY);
  } catch (error) {
    console.error('Error clearing outbox from localStorage:', error);
  }
}
