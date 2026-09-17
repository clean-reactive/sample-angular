import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ordersTestId } from '../../test-ids';
import { Order } from '../order';
import { OrdersResourcePicker } from '../orders-resource-picker';
import { OrdersStatistics } from '../orders-statistics';
import { OrdersRepository, type OrderEntityId } from '../../repository';
import { OrdersSelector } from '../../selectors';

interface Presenter {
  orderIds: OrderEntityId[];
  isProcessing: boolean;
  statusLabel: string;
}

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Order, OrdersResourcePicker, OrdersStatistics],
  templateUrl: './orders.component.html',
})
export class Orders implements Presenter {
  private readonly repository = inject(OrdersRepository);
  private readonly ordersSelector = inject(OrdersSelector);

  private readonly _isLoading = computed(() => this.repository.getOrders.isLoading());
  private readonly _isFetching = computed(() => this.repository.getOrders.isFetching());
  private readonly _isMutating = computed(
    () => this.repository.deleteOrder.isPending() || this.repository.deleteOrderItem.isPending(),
  );

  protected readonly ordersTestId = ordersTestId;

  // presenter
  get orderIds() {
    return this.ordersSelector.result().map((order) => order.id);
  }

  get isProcessing(): boolean {
    return this._isLoading() || this._isFetching() || this._isMutating();
  }

  get statusLabel(): string {
    if (this._isLoading()) {
      return 'loading';
    }
    if (this._isFetching()) {
      return 'fetching';
    }
    if (this._isMutating()) {
      return 'mutating';
    }
    return 'idle';
  }
}
