import { ClientEvents } from "discord.js";

export type FileOptions = {
  event?: keyof ClientEvents
  middleware?: string
  hook?: string
  migration?: string
  timestamp?: number
}