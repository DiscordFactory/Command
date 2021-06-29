export default abstract class BaseCommand {
  protected constructor (readonly identifier: string) {
  }

  public abstract run (): Promise<void>
}

