import BaseCommand from "./BaseCommand";
import Help from "./Commands/Help";
import { Command } from "./types/Command";
import CreateProject from "./Commands/CreateProject";
import MakeFile from "./Commands/MakeFile";

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

  private use (...commands: Command[]) {
    commands.forEach((command) => {
      this.commands.set(command.identifier, command)
    })
  }

  public async dispatch (commandName: string, ...params: string[]): Promise<void> {
    const command = this.commands.get(commandName)
    if (command) {
      return command.run(...params)
    }
    await this.commands.get('help')?.run()
  }
}

// export default class CommandManager {
//   private commandList: Map<string, BaseCommand> = new Map()
//
//   public register (command: BaseCommand) {
//     const item = this.commandList.get(command.identifier)
//
//     if (item) {
//       process.stdout.write(`${Colors.TextCyan}Your project has been well initiated.${Colors.Reset}\n`)
//       Logger.send('error', `The ${item.identifier} was already registered`)
//     }
//
//     this.commandList.set(command.identifier, command)
//   }
//
//   public getCommand(identifier: string): BaseCommand | undefined {
//     return this.commandList.get(identifier)
//   }
// }