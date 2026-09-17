import { Directive, forwardRef, input, InjectionToken } from '@angular/core';
import type { OrderEntityId } from '../../repository';

/** Identifies the Order input context without coupling consumers to its directive class. */
export const ORDER_CONTEXT = new InjectionToken<OrderContext>('OrderContext');

/**
 * Owns the Angular input boundary. Providing the directive through
 * ORDER_CONTEXT makes the reactive `orderId` available to locally scoped
 * selectors, the presenter, and the controller.
 */
@Directive({
  providers: [
    {
      provide: ORDER_CONTEXT,
      useExisting: forwardRef(() => OrderContext),
    },
  ],
})
export class OrderContext {
  readonly orderId = input.required<OrderEntityId>();
}
