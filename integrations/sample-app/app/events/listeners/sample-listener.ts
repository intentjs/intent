import { Injectable } from '@intentjs/core';
import { ListensTo } from '@intentjs/core/events';

@Injectable()
export class OrderPlacedListener {
  @ListensTo('order_placed')
  async handle(data: Record<string, any>): Promise<void> {
    console.log('data ==> ', data);
    // write your code here...
  }
}
