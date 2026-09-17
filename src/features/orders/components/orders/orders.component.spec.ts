import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { Deferred } from '@esfx/async-deferred';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Orders } from './orders.component';
import { provideOrders } from '../../orders.providers';
import { I_ORDERS_GATEWAY, type OrderEntity } from '../../repository';
import {
  makeOrderEntities,
  makeOrdersGatewayMock,
  type MockedOrdersGateway,
} from '../../repository/orders-repository/utils/testing';

interface LocalTestContext {
  gatewayMock: MockedOrdersGateway;
  orderEntities: OrderEntity[];
}

describe(`${Orders.name}`, () => {
  const ordersGatewayMock = makeOrdersGatewayMock();

  beforeEach<LocalTestContext>(async (context) => {
    vi.useFakeTimers();
    context.gatewayMock = ordersGatewayMock.mock;
    context.orderEntities = makeOrderEntities(3);

    await TestBed.configureTestingModule({
      imports: [Orders],
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

  it('has all dependencies resolved', () => {
    const fixture = TestBed.createComponent(Orders);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it<LocalTestContext>('returns an empty array when no orders are available', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue([]);
    const fixture = TestBed.createComponent(Orders);

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.orderIds).toEqual([]);
  });

  it<LocalTestContext>('returns the order IDs when orders are available', async (context) => {
    context.gatewayMock.getOrders.mockResolvedValue(context.orderEntities);
    const fixture = TestBed.createComponent(Orders);

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.orderIds).toEqual(
      context.orderEntities.map((order) => order.id),
    );
  });

  it<LocalTestContext>('returns an empty array while orders are loading', async (context) => {
    const { promise } = new Deferred<OrderEntity[]>();
    context.gatewayMock.getOrders.mockReturnValue(promise);
    const fixture = TestBed.createComponent(Orders);

    await vi.runAllTimersAsync();

    expect(fixture.componentInstance.orderIds).toEqual([]);
  });
});
