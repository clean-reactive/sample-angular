import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { OrdersHttpService } from './api';
import {
  INITIAL_ORDERS,
  InMemoryOrdersService,
  I_ORDERS_GATEWAY,
  makeOrderEntities,
  OrdersRepository,
  OrdersService,
  RemoteOrdersService,
} from './repository';
import { OrdersPresentationStore } from './store';
import { OrdersSelector } from './selectors';

export function provideOrders(): EnvironmentProviders {
  return makeEnvironmentProviders([
    OrdersPresentationStore,
    OrdersRepository,
    OrdersSelector,
    { provide: I_ORDERS_GATEWAY, useClass: OrdersService },
    { provide: INITIAL_ORDERS, useFactory: makeOrderEntities },
    InMemoryOrdersService,
    RemoteOrdersService,
    OrdersHttpService,
  ]);
}
