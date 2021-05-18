export default abstract class Command {
  protected constructor (readonly identifier: string) {
  }

  public abstract run (): Promise<void>
}

