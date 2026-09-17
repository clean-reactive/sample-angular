import { InjectionToken } from '@angular/core';
import type { ItemEntityId, OrderEntityId } from '../../repository';

/** Read-only contract consumed by order.component.html. */
export interface Presenter {
  hasOrder: boolean;
  orderId: OrderEntityId;
  userId: string;
  itemIds: ItemEntityId[];
  summaryLabel: string;
  isDeleteOrderButtonDisabled: boolean;
}

/** User interactions emitted by order.component.html. */
export interface Controller {
  deleteOrderButtonClicked(): void;
}

// The tokens let the composition root select implementations while Order
// depends on contracts.
export const I_ORDER_PRESENTER = new InjectionToken<Presenter>('OrderPresenter');
export const I_ORDER_CONTROLLER = new InjectionToken<Controller>('OrderController');
