import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { deleteOrderButtonTestId, orderTestId } from '../../test-ids';
import { DeleteOrderUseCase } from '../../use-cases';
import { OrderItem } from '../order-item';
import {
  IsDeleteOrderMutatingSelector,
  isDeleteOrderMutatingSelectorContext,
  OrderByIdSelector,
  orderByIdSelectorContext,
} from '../../selectors';
import { ORDER_CONTEXT, OrderContext } from './order.context';
import { OrderController, orderControllerContext } from './order.controller';
import { OrderPresenter, orderPresenterContext } from './order.presenter';
import { I_ORDER_CONTROLLER, I_ORDER_PRESENTER } from './order.types';
import type { Controller, Presenter } from './order.types';
import type { ItemEntityId, OrderEntityId } from '../../repository';

/**
 * Composition root for the fully decomposed Order example.
 *
 * The component wires the input context, selectors, presenter, controller, and
 * use case together.
 */
@Component({
  selector: 'app-order',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderItem],
  // OrderContext turns the `orderId` input into an injectable Signal and
  // provides it within this Order's DI scope.
  // Mental model: this host directive acts like React
  // <OrderContext.Provider value={{ orderId }}>.
  hostDirectives: [{ directive: OrderContext, inputs: ['orderId'] }],
  providers: [
    // Each unit depends only on the contextual data it needs, rather than on
    // the component class that provides it.
    orderByIdSelectorContext.provide(ORDER_CONTEXT),
    // React mental model: OrderByIdSelector reads the { orderId } value with
    // useContext.
    OrderByIdSelector,
    isDeleteOrderMutatingSelectorContext.provide(ORDER_CONTEXT),
    IsDeleteOrderMutatingSelector,
    DeleteOrderUseCase,
    orderPresenterContext.provide(ORDER_CONTEXT),
    // Interface tokens keep the component dependent on contracts, not concrete
    // implementations.
    { provide: I_ORDER_PRESENTER, useClass: OrderPresenter },
    orderControllerContext.provide(ORDER_CONTEXT),
    { provide: I_ORDER_CONTROLLER, useClass: OrderController },
  ],
  templateUrl: './order.component.html',
})
export class Order implements Presenter, Controller {
  private readonly presenter = inject(I_ORDER_PRESENTER);
  private readonly controller = inject(I_ORDER_CONTROLLER);
  protected readonly orderTestId = orderTestId;
  protected readonly deleteOrderButtonTestId = deleteOrderButtonTestId;

  // presenter
  get hasOrder(): boolean {
    return this.presenter.hasOrder;
  }

  get orderId(): OrderEntityId {
    return this.presenter.orderId;
  }

  get userId(): string {
    return this.presenter.userId;
  }

  get itemIds(): ItemEntityId[] {
    return this.presenter.itemIds;
  }

  get summaryLabel(): string {
    return this.presenter.summaryLabel;
  }

  get isDeleteOrderButtonDisabled(): boolean {
    return this.presenter.isDeleteOrderButtonDisabled;
  }

  // controller
  deleteOrderButtonClicked(): void {
    this.controller.deleteOrderButtonClicked();
  }
}
