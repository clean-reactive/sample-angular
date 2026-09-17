import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ordersTestId } from '../../test-ids';
import { Order } from '../order';
import { OrdersResourcePicker } from '../orders-resource-picker';
import { OrdersStatistics } from '../orders-statistics';
import { OrdersRepository, type OrderEntityId } from '../../repository';
import { OrdersSelector } from '../../selectors';

type Status = {
  isSpinnerVisible: boolean;
  label: string;
  badgeType: 'success' | 'warning' | 'error';
};

interface Presenter {
  orderIds: OrderEntityId[];
  status: Status;
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

  protected readonly ordersTestId = ordersTestId;

  // presenter
  get orderIds() {
    return this.ordersSelector.result().map((order) => order.id);
  }

  get status(): Status {
    const isLoading = this.repository.getOrders.isLoading();
    const isFetching = this.repository.getOrders.isFetching();
    const isMutating =
      this.repository.deleteOrder.isPending() || this.repository.deleteOrderItem.isPending();
    const isError = this.repository.getOrders.isError();

    if (isLoading) {
      return { isSpinnerVisible: true, label: 'loading', badgeType: 'warning' };
    }
    if (isFetching) {
      return { isSpinnerVisible: true, label: 'fetching', badgeType: 'warning' };
    }
    if (isMutating) {
      return { isSpinnerVisible: true, label: 'mutating', badgeType: 'warning' };
    }
    if (isError) {
      return { isSpinnerVisible: false, label: 'failed', badgeType: 'error' };
    }
    return { isSpinnerVisible: false, label: 'idle', badgeType: 'success' };
  }
}
