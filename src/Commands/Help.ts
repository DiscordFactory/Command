import Command from "../decorators/Command";
import BaseCommand from "../BaseCommand";
import CommandManager from "../CommandManager";
import Colors from "../types/Colors";

@Command({
  label: 'Help',
  usages: ['factory', 'factory help'],
  description: 'The order gives you the commands available to you.'
})
export default class Help extends BaseCommand {
  constructor () {
    super('help');
  }

  public async run (): Promise<void> {
    CommandManager.getInstance().commands.forEach((command, key) => {
      process.stdout.write(Colors.Reverse + Colors.TextCyan + command.label + ' command' + Colors.Reset + '\n')
      command.usages?.forEach((usage) => {
        process.stdout.write(Colors.Bright + Colors.TextCyan + ' • ' + usage + Colors.Reset + '\n')
      })

      if (command.description) {
        process.stdout.write(Colors.TextCyan + command.description + Colors.Reset + '\n\n')
      }
    })
  }
}