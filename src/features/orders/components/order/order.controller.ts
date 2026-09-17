import { inject, Injectable, type Signal } from '@angular/core';
import type { OrderEntityId } from '../../repository';
import { DeleteOrderUseCase } from '../../use-cases';
import { createContext, injectContext } from '../../../../utils';
import type { Controller } from './order.types';

/**
 * The minimal input needed to translate an Order UI event into an application
 * action.
 */
export const orderControllerContext = createContext<{ orderId: Signal<OrderEntityId> }>();

/**
 * Adapts template callbacks to application use cases. Business orchestration
 * stays in the use case; this controller only supplies the current order ID.
 */
@Injectable()
export class OrderController implements Controller {
  private readonly deleteOrder = inject(DeleteOrderUseCase);
  private readonly context = injectContext(orderControllerContext);

  deleteOrderButtonClicked(): void {
    void this.deleteOrder.execute(this.context.orderId());
  }
}
