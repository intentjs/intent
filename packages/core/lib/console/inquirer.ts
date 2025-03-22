import eqnuirer from 'enquirer';

const { prompt } = eqnuirer;
export class Inquirer {
  /**
   * Use this method to ask the client about any input.
   * @param question
   * @returns Promise<string>
   */
  static async ask(question: string): Promise<string> {
    const answers = await prompt([
      { name: 'question', message: question, type: 'input' },
    ]);
    console.log(answers);
    return answers['question'];
  }

  /**
   * Use this method to ask for confirmation from the client
   * @param question
   */
  static async confirm(message: string): Promise<boolean> {
    const answer = await prompt([
      { name: 'confirm_once', message, type: 'confirm' },
    ]);

    return answer['confirm_once'];
  }

  static async number(message: string): Promise<number> {
    const answer = await prompt([{ name: 'q', message, type: 'numeral' }]);
    return answer['q'];
  }

  /**
   * Use this method to let the client select option from given choices
   * @param question
   * @param choices
   * @returns Promise<string>
   */
  static async select(message: string, choices: string[]): Promise<string> {
    const name = 'command';
    const answers = await prompt([{ type: 'select', name, message, choices }]);
    return answers['command'];
  }

  /**
   * Use this method to let the client select option from given choices
   * @param question
   * @param choices
   * @returns Promise<string>
   */
  static async multiSelect(
    message: string,
    choices: string[],
  ): Promise<string | string[]> {
    const name = 'command';
    const answers = await prompt([
      { type: 'multiselect', name, message, choices, multiple: true },
    ]);
    return answers['command'];
  }

  /**
   * Use this method to ask for a password/hidden input from the client
   * @param question
   * @param mask
   */
  static async password(message: string): Promise<string> {
    const name = 'command';
    const answers = await prompt([{ type: 'password', name, message }]);
    return answers[name];
  }
}
