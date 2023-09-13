export interface MessageType {
  type: string
  text: string
  source: 'parent' | 'child'
}

export function isMessageType(message: unknown): message is MessageType {
  return (
    typeof message === 'object'
    && message !== null
    && 'type' in message
    && 'text' in message
    && 'source' in message
  )
}