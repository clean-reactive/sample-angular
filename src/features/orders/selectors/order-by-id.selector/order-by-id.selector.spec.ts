import { describe, beforeEach, afterEach, it, expect, vi, assert } from 'vitest';
import { Deferred } from '@esfx/async-deferred';
import { provideZonelessChangeDetection, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { OrderByIdSelector, orderByIdSelectorContext } from './order-by-id.selector';
import { OrdersSelector } from '../orders.selector';
import {
  I_ORDERS_GATEWAY,
  OrdersRepository,
  makeOrderEntityId,
  type OrderEntity,
  type OrderEntityId,
} from '../../repository';
import { OrdersPresentationStore } from '../../store';
import {
  makeOrderEntities,
  makeOrdersGatewayMock,
  type MockedOrdersGateway,
} from '../../repository/orders-repository/utils/testing';

interface LocalTestContext {
  gatewayMock: MockedOrdersGateway;
  orderIdSignal: WritableSignal<OrderEntityId>;
  orderEntities: OrderEntity[];
}

describe(`${OrderByIdSelector.name}`, () => {
  const ordersGatewayMock = makeOrdersGatewayMock();

  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();
    context.gatewayMock = ordersGatewayMock.mock;
    context.orderIdSignal = signal(makeOrderEntityId('test'));
    context.orderEntities = makeOrderEntities(3);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
        OrdersPresentationStore,
        OrdersRepository,
        OrdersSelector,
        OrderByIdSelector,
        { provide: I_ORDERS_GATEWAY, useValue: context.gatewayMock },
        {
          provide: orderByIdSelectorContext.token,
          useValue: { orderId: context.orderIdSignal },
        },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it<LocalTestContext>('returns undefined when no orders are available', async (context) => {
    context.orderIdSignal.set(makeOrderEntityId('9000'));
    context.gatewayMock.getOrders.mockResolvedValue([]);

    const selector = TestBed.inject(OrderByIdSelector);

    await vi.runAllTimersAsync();

    expect(selector.result()).toBeUndefined();
  });

  it<LocalTestContext>('returns the correct order when it exists', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const targetOrder = context.orderEntities.at(1);
    assert(targetOrder);
    context.orderIdSignal.set(targetOrder.id);

    const selector = TestBed.inject(OrderByIdSelector);

    await vi.runAllTimersAsync();

    expect(selector.result()).toEqual(targetOrder);
  });

  it<LocalTestContext>('returns undefined when the order with the given ID does not exist', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    context.orderIdSignal.set(makeOrderEntityId('non-existent-id'));

    const selector = TestBed.inject(OrderByIdSelector);

    await vi.runAllTimersAsync();

    expect(selector.result()).toBeUndefined();
  });

  it<LocalTestContext>('returns undefined while orders are being loaded', async (context) => {
    const { promise } = new Deferred<OrderEntity[]>();
    context.gatewayMock.getOrders.mockReturnValue(promise);
    context.orderIdSignal.set(makeOrderEntityId('123'));

    const selector = TestBed.inject(OrderByIdSelector);

    await vi.runAllTimersAsync();

    expect(selector.result()).toBeUndefined();
  });

  it<LocalTestContext>('returns the first order when searching for the first order ID', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const firstOrder = context.orderEntities.at(0);
    assert(firstOrder);
    context.orderIdSignal.set(firstOrder.id);

    const selector = TestBed.inject(OrderByIdSelector);

    await vi.runAllTimersAsync();

    expect(selector.result()).toEqual(firstOrder);
  });

  it<LocalTestContext>('returns the last order when searching for the last order ID', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const lastOrder = context.orderEntities.at(-1);
    assert(lastOrder);
    context.orderIdSignal.set(lastOrder.id);

    const selector = TestBed.inject(OrderByIdSelector);

    await vi.runAllTimersAsync();

    expect(selector.result()).toEqual(lastOrder);
  });
});
