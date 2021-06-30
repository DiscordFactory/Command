import { FileOptions } from "./types/Makes";

export default abstract class BaseMakeFile {
  protected constructor (public type: string) {
  }

  public abstract run (location: string, options?: FileOptions): Promise<void>
}