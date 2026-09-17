import { ChangeDetectionStrategy, Component, computed, inject, type Signal } from '@angular/core';
import { OrdersSelector } from '../../selectors';
import { totalItemQuantityTestId } from '../../test-ids';
import type { OrderEntity } from '../../repository';

interface Presenter {
  uniqueUsersCount: number;
  ordersCount: number;
  itemLinesCount: number;
  totalItemsQuantity: number;
}

@Component({
  selector: 'app-orders-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2">
      <div class="badge badge-ghost gap-1">
        <span>{{ uniqueUsersCount }}</span>
        <span>users</span>
      </div>
      <div class="badge badge-ghost gap-1">
        <span>{{ ordersCount }}</span>
        <span>orders</span>
      </div>
      <div class="badge badge-ghost gap-1">
        <span>{{ itemLinesCount }}</span>
        <span>items</span>
      </div>
      <div class="badge badge-ghost gap-1">
        <span [attr.data-testid]="totalItemQuantityTestId">{{ totalItemsQuantity }}</span>
        <span>qty</span>
      </div>
    </div>
  `,
})
export class OrdersStatistics implements Presenter {
  private readonly ordersSelector = inject(OrdersSelector);

  private get _orders(): Signal<OrderEntity[]> {
    return this.ordersSelector.result;
  }
  private readonly _uniqueUsersCount: Signal<number> = computed(
    () => new Set(this._orders().map((o) => o.userId)).size,
  );
  private readonly _itemLinesCount: Signal<number> = computed(() =>
    this._orders().reduce((acc, o) => acc + o.itemEntities.length, 0),
  );
  private readonly _totalItemsQuantity: Signal<number> = computed(() =>
    this._orders().reduce(
      (acc, entity) =>
        acc + entity.itemEntities.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
      0,
    ),
  );

  protected readonly totalItemQuantityTestId = totalItemQuantityTestId;

  // presenter
  get uniqueUsersCount(): number {
    return this._uniqueUsersCount();
  }

  get ordersCount(): number {
    return this._orders().length;
  }

  get itemLinesCount(): number {
    return this._itemLinesCount();
  }

  get totalItemsQuantity(): number {
    return this._totalItemsQuantity();
  }
}
