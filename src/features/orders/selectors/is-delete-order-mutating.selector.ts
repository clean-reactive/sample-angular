import { computed, Injectable, type Signal } from '@angular/core';
import { injectMutationState } from '@tanstack/angular-query-experimental';
import { deleteOrderMutationKey } from '../repository';
import type { OrderEntityId } from '../repository';
import type { Selector } from '../../../@types';
import { createContext, injectContext } from '../../../utils';

/** Supplies the `orderId` without tying this selector to a component or router. */
export const isDeleteOrderMutatingSelectorContext = createContext<{
  orderId: Signal<OrderEntityId>;
}>();

/** Reports whether the current order has a pending delete mutation in TanStack Query. */
@Injectable()
export class IsDeleteOrderMutatingSelector implements Selector<Signal<boolean>> {
  private readonly _pendingOrderIds = injectMutationState(() => ({
    filters: { mutationKey: deleteOrderMutationKey, status: 'pending' },
    select: (mutation) => {
      const vars = mutation.state.variables as { orderId: OrderEntityId };
      return vars.orderId;
    },
  }));
  private readonly context = injectContext(isDeleteOrderMutatingSelectorContext);

  readonly result = computed(() => this._pendingOrderIds().includes(this.context.orderId()));
}
