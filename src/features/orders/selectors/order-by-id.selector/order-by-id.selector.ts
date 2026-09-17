import { computed, inject, Injectable, type Signal } from '@angular/core';
import { OrdersSelector } from '../orders.selector';
import type { OrderEntity, OrderEntityId } from '../../repository';
import type { Selector } from '../../../../@types';
import { createContext, injectContext } from '../../../../utils';

/** Supplies the `orderId` without tying this selector to a component or router. */
export const orderByIdSelectorContext = createContext<{ orderId: Signal<OrderEntityId> }>();

/** Derives one Order entity from the shared orders collection. */
@Injectable()
export class OrderByIdSelector implements Selector<Signal<OrderEntity | undefined>> {
  private readonly ordersSelector = inject(OrdersSelector);
  private readonly context = injectContext(orderByIdSelectorContext);

  readonly result = computed(() =>
    this.ordersSelector.result().find((o) => o.id === this.context.orderId()),
  );
}
