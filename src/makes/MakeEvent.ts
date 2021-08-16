import BaseMakeFile from "../BaseMakeFile";
import path from "path";
import fs from "fs";
import Colors from "../types/Colors";
import { prepareFile } from "../utils/Files";
import { FileOptions } from "../types/Makes";

export default class MakeEvent extends BaseMakeFile {
  constructor () {
    super('event')
  }

  public async run (dir: string, options: FileOptions): Promise<void> {
    const { templateFile, targetFile, filenameUpper, location } = await prepareFile(this.type, dir)
    await fs.promises.mkdir(path.join(process.cwd(), 'src', location.dir), { recursive: true })

    console.log(this.eventType(options?.event!))

    const fileData = templateFile
      .replace(/\$className/g, filenameUpper)
      .replace('$event', options?.event!)
      .replace('$args', this.eventType(options?.event!))

    await fs.promises.writeFile(targetFile, fileData)

    process.stdout.write(`\n${Colors.Reverse}${Colors.Bright}${Colors.TextGreen}File was created in ${targetFile.replace(/\\/g, '\\\\')}.${Colors.Reset}\n`)
  }

  protected eventType (event: string) {
    const events: { [key in string]: () => string } = {
      'applicationCommandCreate': () => 'command: ApplicationCommand',
      'applicationCommandDelete': () => 'command: ApplicationCommand',
      'applicationCommandUpdate': () => 'oldCommand: ApplicationCommand | null, newCommand: ApplicationCommand',
      'channelCreate': () => 'channel: GuildChannel',
      'channelDelete': () => 'channel: DMChannel | GuildChannel',
      'channelPinsUpdate': () => 'channel: TextBasedChannels, date: Date',
      'channelUpdate': () => 'oldChannel: DMChannel | GuildChannel, newChannel: DMChannel | GuildChannel',
      'debug': () => 'message: string',
      'warn': () => 'message: string',
      'emojiCreate': () => 'emoji: GuildEmoji',
      'emojiDelete': () => 'emoji: GuildEmoji',
      'emojiUpdate': () => 'oldEmoji: GuildEmoji, newEmoji: GuildEmoji',
      'error': () => 'error: Error',
      'guildBanAdd': () => 'ban: GuildBan',
      'guildBanRemove': () => 'ban: GuildBan',
      'guildCreate': () => 'guild: Guild',
      'guildDelete': () => 'guild: Guild',
      'guildUnavailable': () => 'guild: Guild',
      'guildIntegrationsUpdate': () => 'guild: Guild',
      'guildMemberAdd': () => 'member: GuildMember',
      'guildMemberAvailable': () => 'member: GuildMember | PartialGuildMember',
      'guildMemberRemove': () => 'member: GuildMember | PartialGuildMember',
      'guildMembersChunk': () => 'members: Collection<Snowflake, GuildMember>, guild: Guild, data: { count: number; index: number; nonce: string | undefined },',
      'guildMemberUpdate': () => 'oldMember: GuildMember | PartialGuildMember, newMember: GuildMember',
      'guildUpdate': () => 'oldGuild: Guild, newGuild: Guild',
      'inviteCreate': () => 'invite: Invite',
      'inviteDelete': () => 'invite: Invite',
      'message': () => 'message: Message',
      'messageCreate': () => 'message: Message',
      'messageDelete': () => 'message: Message | PartialMessage',
      'messageReactionRemoveAll': () => 'message: Message | PartialMessage',
      'messageReactionRemoveEmoji': () => 'reaction: MessageReaction | PartialMessageReaction',
      'messageDeleteBulk': () => 'messages: Collection<Snowflake, Message | PartialMessage>',
      'messageReactionAdd': () => 'reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser',
      'messageReactionRemove': () => 'reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser',
      'messageUpdate': () => 'oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage',
      'presenceUpdate': () => 'oldPresence: Presence | null, newPresence: Presence',
      'rateLimit': () => 'rateLimitData: RateLimitData',
      'invalidRequestWarning': () => 'invalidRequestWarningData: InvalidRequestWarningData',
      'ready': () => 'client: Client<true>',
      'invalidated': () => '',
      'roleCreate': () => 'role: Role',
      'roleDelete': () => 'role: Role',
      'roleUpdate': () => 'oldRole: Role, newRole: Role',
      'threadCreate': () => 'thread: ThreadChannel',
      'threadDelete': () => 'thread: ThreadChannel',
      'threadListSync': () => 'threads: Collection<Snowflake, ThreadChannel>',
      'threadMemberUpdate': () => 'oldMember: ThreadMember, newMember: ThreadMember',
      'threadMembersUpdate': () => 'oldMembers: Collection<Snowflake, ThreadMember>, mewMembers: Collection<Snowflake, ThreadMember>',
      'threadUpdate': () => 'oldThread: ThreadChannel, newThread: ThreadChannel',
      'typingStart': () => 'typing: Typing',
      'userUpdate': () => 'oldUser: User | PartialUser, newUser: User',
      'voiceStateUpdate': () => 'oldState: VoiceState, newState: VoiceState',
      'webhookUpdate': () => 'channel: TextChannel',
      'interaction': () => 'interaction: Interaction',
      'interactionCreate': () => 'interaction: Interaction',
      'shardDisconnect': () => 'closeEvent: CloseEvent, shardId: number',
      'shardError': () => 'error: Error, shardId: number',
      'shardReady': () => 'shardId: number, unavailableGuilds: Set<Snowflake> | undefined',
      'shardReconnecting': () => 'shardId: number',
      'shardResume': () => 'shardId: number, replayedEvents: number',
      'stageInstanceCreate': () => 'stageInstance: StageInstance',
      'stageInstanceUpdate': () => 'oldStageInstance: StageInstance | null, newStageInstance: StageInstance',
      'stageInstanceDelete': () => 'stageInstance: StageInstance',
      'stickerCreate': () => 'sticker: Sticker',
      'stickerDelete': () => 'sticker: Sticker',
      'stickerUpdate': () => 'oldSticker: Sticker, newSticker: Sticker',
    }
    return events[event]()
  }
}