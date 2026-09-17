import { computed, inject, Injectable, type Signal } from '@angular/core';
import type { ItemEntityId, OrderEntityId } from '../../repository';
import { IsDeleteOrderMutatingSelector, OrderByIdSelector } from '../../selectors';
import { createContext, injectContext } from '../../../../utils';
import type { Presenter } from './order.types';

/** The route-independent input required to present one order. */
export const orderPresenterContext = createContext<{ orderId: Signal<OrderEntityId> }>();

const DEFAULT_ITEM_IDS: ItemEntityId[] = [];
const DEFAULT_USER_ID = '';

/**
 * Converts selector results into stable, template-ready values. The presenter
 * performs no mutations and returns safe defaults while the order is
 * unavailable.
 */
@Injectable()
export class OrderPresenter implements Presenter {
  private readonly context = injectContext(orderPresenterContext);
  private readonly orderByIdSelector = inject(OrderByIdSelector);
  private readonly isDeleteOrderMutatingSelector = inject(IsDeleteOrderMutatingSelector);

  private readonly _itemIds = computed(
    (): ItemEntityId[] =>
      this.orderByIdSelector.result()?.itemEntities.map((i) => i.id) ?? DEFAULT_ITEM_IDS,
  );
  private readonly _summaryLabel = computed(() => {
    const count = this._itemIds().length;
    return `${count} item${count !== 1 ? 's' : ''}`;
  });

  get hasOrder(): boolean {
    return this.orderByIdSelector.result() !== undefined;
  }
  get orderId(): OrderEntityId {
    return this.context.orderId();
  }
  get userId(): string {
    return this.orderByIdSelector.result()?.userId ?? DEFAULT_USER_ID;
  }
  get itemIds(): ItemEntityId[] {
    return this._itemIds();
  }
  get summaryLabel(): string {
    return this._summaryLabel();
  }
  get isDeleteOrderButtonDisabled(): boolean {
    return this.isDeleteOrderMutatingSelector.result();
  }
}
