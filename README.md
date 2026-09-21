# Clean Reactive Architecture — Angular Sample

A sample application that demonstrates [Clean Reactive Architecture](https://github.com/clean-reactive/documentation/blob/main/docs/architecture.md) implemented with Angular.

The sample shows a concrete, working mapping of every architectural unit from the diagram to idiomatic Angular code.

>:bulb: **Architecture reference implementation.** `components/order` intentionally keeps every unit separate so the complete architecture is visible. This is for understanding the boundaries and how a codebase may evolve, not a rule that every component must follow. Simpler components inline units that have no independent policy or reuse. See the [Development Methodology](https://github.com/clean-reactive/documentation/blob/main/docs/methodology.md) for the incremental approach behind these choices.

> :bulb: **Multiple data resources.** The repository accesses either an in-memory resource or a remote API through the same gateway contract. This demonstrates substituting resource implementations without changing the consuming units. Multiple resources and runtime switching are included for demonstration purposes, not required by the architecture.

![Angular sample application](./sample.gif)

## Getting started

Install dependencies:

```sh
npm ci
```

Start the development server:

```sh
npm start
```

## Tech stack

- [Angular](https://angular.dev/) 21
- [TanStack Query](https://tanstack.com/query/latest) (`@tanstack/angular-query-experimental`)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/)
- [Vitest](https://vitest.dev/) + Angular `TestBed`
- [MSW](https://mswjs.io/) for network-level HTTP interception in gateway tests
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) for dependency validation and graph visualization

## Architecture mapping

The table below shows how each unit from the Clean Reactive Architecture diagram maps to this codebase.

| Architectural unit | Angular equivalent | Location |
| --- | --- | --- |
| Application business entity | Injectable class with Angular `signal` | `store/orders-presentation.store.ts` |
| Enterprise business entity | TypeScript type | `repository/orders-repository/orders.repository.types.ts` |
| Gateway interface | TypeScript interface + `InjectionToken` | `OrdersGateway` in `repository/orders-repository/orders.repository.types.ts` |
| Repository (gateway + entities) | Injectable class with TanStack Query | `repository/orders-repository/orders.repository.ts` |
| Gateway implementation | Injectable class implementing `OrdersGateway` | `InMemoryOrdersService`, `RemoteOrdersService` |
| Use case interactor | Injectable class or method on the interaction owner | `use-cases/delete-order.use-case.ts`, `components/order-item/order-item.component.ts` |
| Selector | Injectable class with `computed` | `selectors/order-by-id.selector`, `is-delete-order-mutating.selector.ts` |
| Presenter | Injectable class exposing ViewModels | `components/order/order.presenter.ts` |
| ViewModel | Value returned by each presenter property | `Presenter` properties in `components/order/order.types.ts` |
| Controller | Injectable class exposing event handlers | `components/order/order.controller.ts` |
| User interface | Angular component | `components/orders`, `components/order`, `components/order-item` |

## Key design decisions

These decisions are specific to this sample, guided by its demonstration goals
and the capabilities of Angular and the selected libraries. The architecture
defines responsibilities and boundaries without prescribing specific technical
solutions.

**Extracted units as Angular injectables.** Extracted units in this sample are
implemented as injectable classes composed through Angular DI.

**Component classes as composition roots.** A component class composes the units
used by its view and wires their dependencies through Angular DI.

**Self-contained Angular components.** Components in this sample own their
view-facing behavior and resolve their data within their own composition
boundary. Their inputs are limited to identity or configuration parameters, such as
`orderId` and `itemId`, rather than receiving data through inputs. This is a
deliberate demonstration choice to reduce structural coupling, not a mandatory rule.

**Context API for scoped data.** A context makes a value available within a
component's DI scope. The `Order` component provides its reactive `orderId`
once, and each unit created in that scope can read it from context. This avoids
passing `orderId` to every unit manually or coupling those units to the `Order`
component. The mental model is React's `<Context.Provider value={...}>` and
`useContext`.

**Application business entity as an Angular signal-based class.**
`OrdersPresentationStore` holds application-level state (`ordersResource:
"local" | "remote"`) that persists across use case calls and has its own rules.
It is managed by a dedicated injectable class backed by Angular signals, not by
TanStack Query.

**Repository as a TanStack Query injectable class.** `OrdersRepository` combines
gateway access and observable entity state. It consumes `OrdersGateway` through
`I_ORDERS_GATEWAY`, exposes query and mutation operations, and manages the
entity cache that presenters and selectors read from.

**Gateway selection at runtime.** Angular DI binds `I_ORDERS_GATEWAY` to
`OrdersService`, which delegates calls to `InMemoryOrdersService` or
`RemoteOrdersService` according to `ordersResource`. Switching resources
changes the delegate, while the DI binding remains the same.

**Signals for reactive state.** Selectors expose `computed` signals.
`OrderPresenter` reads them through getters that return plain values to the
template, preserving Angular's reactive tracking.

## UML diagram representing application architecture

![clean-reactive-architecture-repository-with-gateway-interface](./clean-reactive-architecture-repository-with-gateway-interface.png)

<details>
  <summary>mermaid</summary>

```mermaid
graph TD

subgraph R1["Repository"]
  E["Entities"]
  G["Gateway"]
  GI["Gateway < I >"]
end

ER["External Resource"]
UI["User Interface"]
P["Presenter"]
C["Controller"]
PI["Presenter < I >"]
CI["Controller < I >"]
UC["Use Case Interactor"]

%% implementation relation
P -. implements .-> PI
C -. implements .-> CI
G -. implements .-> GI

%% dependency relation
UI -- depends --> PI
UI -- depends --> CI
C -- depends --> UC
P -- depends --> E
UC -- depends --> E
UC -- depends --> GI
G -- depends --> ER

classDef repository fill:none,stroke:#666,stroke-width:2px,stroke-dasharray: 5 5;
class R1 repository;
```

</details>

## Folder structure

```console
src/features
└── orders
    ├── api                         # external resource (HTTP client + API)
    │   ├── api-orders-dto.factory.ts
    │   ├── api-orders.service.ts
    │   └── types.ts
    ├── components                  # user interface, presenters, controllers
    │   ├── order
    │   │   ├── order.component.ts
    │   │   ├── order.component.html
    │   │   ├── order.context.ts
    │   │   ├── order.controller.ts
    │   │   ├── order.presenter.ts
    │   │   └── order.types.ts
    │   ├── order-item
    │   │   ├── order-item.component.ts
    │   │   └── order-item.component.html
    │   ├── orders
    │   │   ├── orders.component.ts
    │   │   └── orders.component.html
    │   ├── orders-resource-picker
    │   │   └── orders-resource-picker.component.ts
    │   └── orders-statistics
    │       └── orders-statistics.component.ts
    ├── repository                  # repository, gateway interface, gateway implementations
    │   └── orders-repository
    │       ├── orders-service
    │       │   ├── in-memory-orders-service
    │       │   │   ├── in-memory-orders.service.ts
    │       │   │   └── order-entity.factory.ts
    │       │   ├── orders.service.ts
    │       │   └── remote-orders-service
    │       │       └── remote-orders.service.ts
    │       ├── orders.repository.ts
    │       └── orders.repository.types.ts
    ├── selectors                   # selectors
    │   ├── is-delete-order-mutating.selector.ts
    │   ├── order-by-id.selector
    │   │   └── order-by-id.selector.ts
    │   └── orders.selector.ts
    ├── store                       # application business entity
    │   └── orders-presentation.store.ts
    ├── use-cases                   # use case interactors
    │   └── delete-order.use-case.ts
    ├── orders.providers.ts
    └── test-ids.ts
```

## Further reading

- [Clean Reactive Architecture](https://github.com/clean-reactive/documentation/blob/main/docs/architecture.md)
- [Development Methodology](https://github.com/clean-reactive/documentation/blob/main/docs/methodology.md)

## Dependency graph

![dependency-graph](./dependency-graph.svg)
