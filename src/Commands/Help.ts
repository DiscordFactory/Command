import Command from "../Command";

export default class Help extends Command {
  constructor () {
    super('help');
  }
  public async run (): Promise<void> {
    process.stdout.write(`Make choosing file : factory make:file\nMake new project : factory create-project`)
  }

}