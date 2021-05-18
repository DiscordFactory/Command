import CommandManager from "./CommandManager";
import MakeFile from "./Commands/MakeFile";
import CreateProject from "./Commands/CreateProject";
import Help from "./Commands/Help";

export default class Dispatcher {
  private commandManager = new CommandManager()
  constructor () {
    this.commandManager.register(new Help())
    this.commandManager.register(new MakeFile())
    this.commandManager.register(new CreateProject())
  }

  public async dispatch (commandName: string): Promise<void> {
    const command = this.commandManager.getCommand(commandName)
    if (command) {
      return await command.run()
    }
    await this.commandManager.getCommand('help')?.run()
  }
}
