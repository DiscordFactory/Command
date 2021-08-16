import { CommandContext } from '../types/Command';

export default function Command (context: CommandContext) {
  return (target: Function) => {
    target.prototype.label = context.label
    target.prototype.description = context.description
    target.prototype.usages = context.usages
  }
}