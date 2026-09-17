import { inject, Injectable } from '@angular/core';
import type { UseCase } from '../../../@types';
import { OrdersRepository, type OrderEntityId } from '../repository';

/**
 * Application-level delete operation. It owns mutation orchestration and the
 * error boundary, keeping those concerns out of both the UI controller and
 * repository adapter.
 */
@Injectable()
export class DeleteOrderUseCase implements UseCase<OrderEntityId> {
  private readonly repository = inject(OrdersRepository);

  async execute(orderId: OrderEntityId): Promise<void> {
    try {
      await this.repository.deleteOrder.mutateAsync({ orderId });
    } catch (error) {
      console.error('DeleteOrderUseCase', error);
    }
  }
}
