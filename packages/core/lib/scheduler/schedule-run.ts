export class ScheduleRun {
  // Second-based schedules
  static everySecond = '* * * * * *';
  static everyTwoSeconds = '*/2 * * * * *';
  static everyFiveSeconds = '*/5 * * * * *';
  static everyTenSeconds = '*/10 * * * * *';
  static everyFifteenSeconds = '*/15 * * * * *';
  static everyTwentySeconds = '*/20 * * * * *';
  static everyThirtySeconds = '*/30 * * * * *';

  // Minute-based schedules
  static everyMinute = '* * * * *';
  static everyTwoMinutes = '*/2 * * * *';
  static everyThreeMinutes = '*/3 * * * *';
  static everyFourMinutes = '*/4 * * * *';
  static everyFiveMinutes = '*/5 * * * *';
  static everyTenMinutes = '*/10 * * * *';
  static everyFifteenMinutes = '*/15 * * * *';
  static everyThirtyMinutes = '*/30 * * * *';

  // Hour-based schedules
  static hourly = '0 * * * *';
  static hourlyAt(minute: number): string {
    return `${minute} * * * *`;
  }
  static everyOddHour(minutes = 0): string {
    return `${minutes} */2 * * *`;
  }
  static everyTwoHours(minutes = 0): string {
    return `${minutes} */2 * * *`;
  }
  static everyThreeHours(minutes = 0): string {
    return `${minutes} */3 * * *`;
  }
  static everyFourHours(minutes = 0): string {
    return `${minutes} */4 * * *`;
  }
  static everySixHours(minutes = 0): string {
    return `${minutes} */6 * * *`;
  }

  // Day-based schedules
  static daily = '0 0 * * *';
  static dailyAt(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} * * *`;
  }
  static twiceDaily(first: number, second: number): string {
    return `0 ${first},${second} * * *`;
  }
  static twiceDailyAt(first: number, second: number, minutes: number): string {
    return `${minutes} ${first},${second} * * *`;
  }

  // Week-based schedules
  static weekly = '0 0 * * 0';
  static weeklyOn(day: number, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} * * ${day}`;
  }

  // Month-based schedules
  static monthly = '0 0 1 * *';
  static monthlyOn(day: number, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} ${day} * *`;
  }
  static twiceMonthly(first: number, second: number, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} ${first},${second} * *`;
  }
  static lastDayOfMonth(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} L * *`;
  }

  // Quarter-based schedules
  static quarterly = '0 0 1 */3 *';
  static quarterlyOn(day: number, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} ${day} */3 *`;
  }

  // Year-based schedules
  static yearly = '0 0 1 1 *';
  static yearlyOn(month: number, day: number, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} ${day} ${month} *`;
  }
}
