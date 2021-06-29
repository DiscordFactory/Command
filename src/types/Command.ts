export type CommandContext = {
  label?: string
  description?: string
  usages?: string[]
}

export interface Command extends CommandContext {
  identifier: string
  run (): void
}