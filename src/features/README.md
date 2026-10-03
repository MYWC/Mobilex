# Feature modules

Feature modules own business capabilities that will grow independently:

- auth
- catalog
- cart
- wishlist
- orders

Keep feature-local hooks, services, schemas and state inside each feature unless they are genuinely cross-feature.
