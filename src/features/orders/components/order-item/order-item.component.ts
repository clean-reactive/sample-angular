import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { injectMutationState } from '@tanstack/angular-query-experimental';
import { deleteItemButtonTestId, orderItemTestId } from '../../test-ids';
import {
  deleteOrderItemMutationKey,
  deleteOrderMutationKey,
  OrdersRepository,
  type ItemEntityId,
  type OrderEntityId,
} from '../../repository';
import { OrdersSelector } from '../../selectors';

interface Presenter {
  hasItem: boolean;
  itemIdLabel: ItemEntityId;
  productIdLabel: string;
  productQuantity: number;
  isDeleteItemButtonDisabled: boolean;
}

interface Controller {
  deleteOrderItemButtonClicked(): Promise<void>;
}

@Component({
  selector: 'app-order-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-item.component.html',
})
export class OrderItem implements Presenter, Controller {
  private readonly repository = inject(OrdersRepository);
  private readonly ordersSelector = inject(OrdersSelector);

  readonly orderId = input.required<OrderEntityId>();
  readonly itemId = input.required<ItemEntityId>();

  private readonly _item = computed(() => {
    const order = this.ordersSelector.result().find((candidate) => candidate.id === this.orderId());
    return order?.itemEntities.find((item) => item.id === this.itemId());
  });
  private readonly _pendingOrderIds = injectMutationState(() => ({
    filters: { mutationKey: deleteOrderMutationKey, status: 'pending' },
    select: (mutation) => {
      const variables = mutation.state.variables as { orderId: OrderEntityId };
      return variables.orderId;
    },
  }));
  private readonly _pendingItemDeletes = injectMutationState(() => ({
    filters: { mutationKey: deleteOrderItemMutationKey, status: 'pending' },
    select: (mutation) => {
      const variables = mutation.state.variables as {
        orderId: OrderEntityId;
        itemId: ItemEntityId;
      };
      return variables.orderId === this.orderId() && variables.itemId === this.itemId();
    },
  }));
  private readonly _isDeleteItemButtonDisabled = computed(
    () =>
      this._pendingItemDeletes().includes(true) || this._pendingOrderIds().includes(this.orderId()),
  );

  protected readonly orderItemTestId = orderItemTestId;
  protected readonly deleteItemButtonTestId = deleteItemButtonTestId;

  get hasItem(): boolean {
    return this._item() !== undefined;
  }

  get itemIdLabel(): ItemEntityId {
    return this.itemId();
  }

  get productIdLabel(): string {
    return this._item()?.productId ?? '';
  }

  get productQuantity(): number {
    return this._item()?.quantity ?? 0;
  }

  get isDeleteItemButtonDisabled(): boolean {
    return this._isDeleteItemButtonDisabled();
  }

  async deleteOrderItemButtonClicked(): Promise<void> {
    const orderId = this.orderId();
    const itemId = this.itemId();

    try {
      const order = this.ordersSelector.result().find((candidate) => candidate.id === orderId);
      if (order?.itemEntities.length === 1) {
        await this.repository.deleteOrder.mutateAsync({ orderId });
        return;
      }
      await this.repository.deleteOrderItem.mutateAsync({ orderId, itemId });
    } catch (error) {
      console.error('OrderItem.deleteOrderItem', error);
    }
  }
}
