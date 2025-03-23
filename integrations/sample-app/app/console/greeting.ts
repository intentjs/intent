import { Command, ConsoleIO } from '@intentjs/core/console';

/**
 * Sample command, feel free to remove this file.
 */
@Command('greet', { desc: 'Command to print a greeting on console' })
export class GreetingCommand {
  async handle(_cli: ConsoleIO): Promise<void> {
    const quote = this.randomQuote();
    _cli.info(`${quote.author} once said -`);
    _cli.success(`"${quote.quote}"`);
  }

  randomQuote(): { quote: string; author: string } {
    const quote = [
      {
        quote:
          'Do not pity the dead, Harry. Pity the living, and, above all those who live without love.',
        author: 'Albus Dumbledore',
      },
      {
        quote: 'It is impossible to manufacture or imitate love',
        author: 'Horace Slughorn',
      },
      {
        quote:
          "Being different isn't a bad thing. I mean that you are brave enough to be yourself.",
        author: 'Luna Lovegood',
      },
      {
        quote:
          'If you want to know what a man’s like, take a good look at how he treats his inferiors, not his equals.',
        author: 'Sirius Black',
      },
      {
        quote:
          'Never trust anything that can think for itself if you can’t see where it keeps its brain.',
        author: 'Arthur Weasley',
      },
      {
        quote: 'Every human life is worth the same, and worth saving.',
        author: 'Kingsley Shacklebolt',
      },
      {
        quote: 'Have a biscuit, Potter.',
        author: 'Minerva McGonagall',
      },
      {
        quote:
          'Happiness can be found even in the darkest of times if one only remembers to turn on the light.',
        author: 'Albus Dumbledore',
      },
      {
        quote: 'Socks are Dobby’s favorite, favorite clothes, sir!',
        author: 'Dobby',
      },
    ];

    const diceRoll = Math.floor(Math.random() * (9 - 0) + 0);
    return quote.at(diceRoll);
  }
}
