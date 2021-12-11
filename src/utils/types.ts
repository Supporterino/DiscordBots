/**
 * A class to represent the answer object of the urban dictonary API since it has no `@types`
 */
export class DefinitionObject {
  author!: string;
  current_vote!: string;
  date!: string;
  defid!: number;
  definition!: string;
  example!: string;
  permalink!: string;
  sound_urls!: Array<string>;
  thumbs_down!: number;
  thumbs_up!: number;
  word!: string;
  written_on!: string;
}
