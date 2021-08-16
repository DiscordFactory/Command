import Help from './Commands/Help';
import { Command } from './types/Command';
import CreateProject from './Commands/CreateProject';
import MakeFile from './Commands/MakeFile';

export default class CommandManager {
  public static $instance: CommandManager
  public commands: Map<string, Command> = new Map()

  constructor () {
    this.use(
      new Help(),
      new CreateProject(),
      new MakeFile()
    )
  }

  public static getInstance () {
    if (!this.$instance) {
      this.$instance = new CommandManager()
    }
    return this.$instance
  }

  public async dispatch (commandName: string, ...params: string[]): Promise<void> {
    const command = this.commands.get(commandName)
    if (command) {
      return command.run(...params)
    }
    await this.commands.get('help')?.run()
  }

  private use (...commands: Command[]) {
    commands.forEach((command) => {
      this.commands.set(command.identifier, command)
    })
  }
}