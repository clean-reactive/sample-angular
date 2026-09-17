import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { Deferred } from '@esfx/async-deferred';
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderItem } from './order-item.component';
import {
  I_ORDERS_GATEWAY,
  makeItemEntityId,
  makeOrderEntityId,
  type ItemEntityId,
  type OrderEntity,
  type OrderEntityId,
} from '../../repository';
import { provideOrders } from '../../orders.providers';
import { makeOrderEntities } from '../../test-utils';
import {
  makeOrdersGatewayMock,
  type MockedOrdersGateway,
} from '../../repository/orders-repository/utils/testing';

interface LocalTestContext {
  gatewayMock: MockedOrdersGateway;
  orderEntities: OrderEntity[];
}

describe(`${OrderItem.name}`, () => {
  const ordersGatewayMock = makeOrdersGatewayMock();

  beforeEach<LocalTestContext>(async (context) => {
    vi.useFakeTimers();
    context.gatewayMock = ordersGatewayMock.mock;
    context.orderEntities = makeOrderEntities(3);

    await TestBed.configureTestingModule({
      imports: [OrderItem],
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
        provideOrders(),
        { provide: I_ORDERS_GATEWAY, useValue: context.gatewayMock },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createComponent(orderId: OrderEntityId, itemId: ItemEntityId) {
    const fixture = TestBed.createComponent(OrderItem);
    fixture.componentRef.setInput('orderId', orderId);
    fixture.componentRef.setInput('itemId', itemId);
    return fixture;
  }

  it('has all dependencies resolved', () => {
    const fixture = createComponent(makeOrderEntityId('order-1'), makeItemEntityId('item-1'));
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it<LocalTestContext>('has no item when no orders are available', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue([]);
    const fixture = createComponent(makeOrderEntityId('order-1'), makeItemEntityId('item-1'));

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.hasItem).toBe(false);
  });

  it<LocalTestContext>('has no item while orders are loading', async (context) => {
    const { promise } = new Deferred<OrderEntity[]>();
    context.gatewayMock.getOrders.mockReturnValue(promise);
    const fixture = createComponent(makeOrderEntityId('order-1'), makeItemEntityId('item-1'));

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.hasItem).toBe(false);
  });

  it<LocalTestContext>('has no item when the order does not exist', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const fixture = createComponent(
      makeOrderEntityId('non-existent-order'),
      makeItemEntityId('item-1'),
    );

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.hasItem).toBe(false);
  });

  it<LocalTestContext>('has no item when it does not exist in the order', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const targetOrder = context.orderEntities.at(0);
    assert(targetOrder);
    const fixture = createComponent(targetOrder.id, makeItemEntityId('non-existent-item'));

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.hasItem).toBe(false);
  });

  it<LocalTestContext>('presents the item when it exists', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const targetOrder = context.orderEntities.at(1);
    assert(targetOrder);
    const targetItem = targetOrder.itemEntities.at(0);
    assert(targetItem);
    const fixture = createComponent(targetOrder.id, targetItem.id);

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.hasItem).toBe(true);
    expect(fixture.componentInstance.itemIdLabel).toBe(targetItem.id);
    expect(fixture.componentInstance.productIdLabel).toBe(targetItem.productId);
    expect(fixture.componentInstance.productQuantity).toBe(targetItem.quantity);
  });
});
