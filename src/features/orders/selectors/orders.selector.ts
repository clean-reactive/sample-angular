import { computed, inject, Injectable, type Signal } from '@angular/core';
import { OrdersRepository } from '../repository';
import type { OrderEntity } from '../repository';
import type { Selector } from '../../../@types';

const DEFAULT_ORDERS: OrderEntity[] = [];

/**
 * Normalizes repository query state into the shared Order entity collection
 * used by selectors.
 */
@Injectable()
export class OrdersSelector implements Selector<Signal<OrderEntity[]>> {
  private readonly repository = inject(OrdersRepository);

  readonly result = computed(() => this.repository.getOrders.data() ?? DEFAULT_ORDERS);
}
