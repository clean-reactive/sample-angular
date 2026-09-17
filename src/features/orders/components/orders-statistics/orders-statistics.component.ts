import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrdersSelector } from '../../selectors';
import { totalItemQuantityTestId } from '../../test-ids';

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
  private readonly orders = inject(OrdersSelector).result;

  protected readonly totalItemQuantityTestId = totalItemQuantityTestId;

  // presenter
  get uniqueUsersCount(): number {
    return new Set(this.orders().map((order) => order.userId)).size;
  }

  get ordersCount(): number {
    return this.orders().length;
  }

  get itemLinesCount(): number {
    return this.orders().reduce((count, order) => count + order.itemEntities.length, 0);
  }

  get totalItemsQuantity(): number {
    return this.orders().reduce(
      (total, order) =>
        total + order.itemEntities.reduce((subtotal, item) => subtotal + item.quantity, 0),
      0,
    );
  }
}
